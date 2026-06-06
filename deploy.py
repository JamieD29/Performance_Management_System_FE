"""
KPIS Project - Deploy Script v4
Chạy: python deploy.py
Yêu cầu: pip install paramiko
"""

import paramiko
import sys

# ============================================================
VPS_HOST = "172.29.74.65"
VPS_USER = "kpis"
VPS_PASSWORD = "KPIs.2026"
PROJECT_DIR = "/home/kpis/kpis-project"
FE_DIR = f"{PROJECT_DIR}/Performance_Management_System_FE"
BE_DIR = f"{PROJECT_DIR}/OKR-KPI-Management-System---BE"
# ============================================================

DOCKERFILE_FE = '''# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --noEmitOnError false || npx vite build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
'''

NGINX_CONF_FE = '''server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
'''

DOCKERFILE_BE = '''# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/main.js"]
'''


def connect():
    print(f"🔗 Đang kết nối vào {VPS_HOST}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(VPS_HOST, username=VPS_USER, password=VPS_PASSWORD, timeout=10)
        print("✅ Kết nối thành công!\n")
        return client
    except Exception as e:
        print(f"❌ Không kết nối được: {e}")
        print("👉 Hãy kiểm tra VPN đã bật chưa!")
        sys.exit(1)


def run(client, cmd, show_output=True, timeout=600):
    transport = client.get_transport()
    channel = transport.open_session()
    channel.set_combine_stderr(True)
    channel.exec_command(cmd)
    output = ""
    while True:
        if channel.recv_ready():
            data = channel.recv(4096).decode("utf-8", errors="replace")
            output += data
            if show_output:
                print(data, end="", flush=True)
        if channel.exit_status_ready():
            while channel.recv_ready():
                data = channel.recv(4096).decode("utf-8", errors="replace")
                output += data
                if show_output:
                    print(data, end="", flush=True)
            break
    exit_code = channel.recv_exit_status()
    channel.close()
    return exit_code, output


def write_file(client, path, content):
    """Ghi file lên VPS qua SFTP"""
    sftp = client.open_sftp()
    with sftp.open(path, 'w') as f:
        f.write(content)
    sftp.close()


def ensure_dockerfiles(client):
    """Đảm bảo Dockerfile luôn tồn tại"""
    print("📋 Kiểm tra Dockerfile...")
    _, out = run(client, f"ls {FE_DIR}/Dockerfile {FE_DIR}/nginx.conf {BE_DIR}/Dockerfile 2>&1", show_output=False)
    if "No such file" in out:
        print("⚠️  Dockerfile bị mất, đang tạo lại...")
        write_file(client, f"{FE_DIR}/Dockerfile", DOCKERFILE_FE)
        write_file(client, f"{FE_DIR}/nginx.conf", NGINX_CONF_FE)
        write_file(client, f"{BE_DIR}/Dockerfile", DOCKERFILE_BE)
        print("✅ Đã tạo lại Dockerfile!")
    else:
        print("✅ Dockerfile OK!")


def fix_permissions(client, directory):
    run(client, f"sudo chown -R kpis:kpis {directory}", show_output=False)


def git_pull_fe(client):
    print("\n📥 Pull code FE...")
    fix_permissions(client, FE_DIR)
    run(client, f"cd {FE_DIR} && git fetch --all", show_output=False)
    code, _ = run(client, f"cd {FE_DIR} && git reset --hard origin/main && git clean -fd && git pull")
    # Sau khi reset hard, tạo lại Dockerfile vì có thể bị xóa
    write_file(client, f"{FE_DIR}/Dockerfile", DOCKERFILE_FE)
    write_file(client, f"{FE_DIR}/nginx.conf", NGINX_CONF_FE)
    if code == 0:
        print("✅ Pull FE thành công!")
    else:
        print("❌ Pull FE thất bại!")
    return code


def git_pull_be(client):
    print("\n📥 Pull code BE...")
    fix_permissions(client, BE_DIR)
    run(client, f"cd {BE_DIR} && git fetch --all", show_output=False)
    code, _ = run(client, f"cd {BE_DIR} && git reset --hard origin/main && git clean -fd && git pull")
    write_file(client, f"{BE_DIR}/Dockerfile", DOCKERFILE_BE)
    if code == 0:
        print("✅ Pull BE thành công!")
    else:
        print("❌ Pull BE thất bại!")
    return code


def build_service(client, service=""):
    service_name = service if service else "tất cả"
    print(f"\n🔨 Build {service_name} (có thể mất 5-10 phút)...")
    cmd = f"cd {PROJECT_DIR} && docker compose up -d --build {service}".strip()

    # Retry 2 lần nếu lỗi mạng
    for attempt in range(1, 3):
        code, output = run(client, cmd)
        if code == 0:
            print(f"✅ Build {service_name} thành công!")
            return code
        if "failed to authorize" in output or "EOF" in output or "Unavailable" in output:
            print(f"⚠️  Lỗi mạng Docker Hub, thử lại lần {attempt + 1}...")
            run(client, "docker system prune -f", show_output=False)
        else:
            print(f"❌ Build thất bại! Chọn option 5 để xem logs chi tiết.")
            return code
    print("❌ Build thất bại sau 2 lần thử!")
    return 1


def deploy_full(client):
    print("\n🚀 Deploy full FE + BE...\n")
    git_pull_fe(client)
    git_pull_be(client)
    build_service(client)
    print("🌐 Truy cập: https://beta.fit.hcmus.edu.vn")


def deploy_fe_only(client):
    print("\n🚀 Deploy chỉ FE...\n")
    git_pull_fe(client)
    build_service(client, "frontend")
    print("🌐 Truy cập: https://beta.fit.hcmus.edu.vn")


def deploy_be_only(client):
    print("\n🚀 Deploy chỉ BE...\n")
    git_pull_be(client)
    build_service(client, "backend")


def restart_only(client):
    print("\n♻️  Restart containers...\n")
    run(client, f"cd {PROJECT_DIR} && docker compose restart")
    print("\n✅ Restart hoàn tất!")


def show_logs(client):
    print("\nXem logs của service nào?")
    print("  1. Frontend")
    print("  2. Backend")
    print("  3. Database")
    print("  4. Tất cả")
    choice = input("Chọn (1-4): ").strip()
    service_map = {"1": "frontend", "2": "backend", "3": "postgres", "4": ""}
    service = service_map.get(choice, "")
    print(f"\n📋 Logs ({service or 'all'}):\n")
    run(client, f"cd {PROJECT_DIR} && docker compose logs --tail=50 {service}")


def show_status(client):
    print("\n📊 Trạng thái containers:\n")
    run(client, f"cd {PROJECT_DIR} && docker compose ps")


def pull_only(client):
    print("\n📥 Pull code mới từ GitHub...\n")
    git_pull_fe(client)
    git_pull_be(client)
    print("\n✅ Pull hoàn tất! Chọn option 1/2/3 để build.")


def menu():
    print("\n" + "=" * 50)
    print("  KPIS PROJECT - DEPLOY TOOL v4")
    print("=" * 50)
    print("  1. Deploy full FE + BE (git pull + build)")
    print("  2. Deploy chỉ FE (git pull + build FE)")
    print("  3. Deploy chỉ BE (git pull + build BE)")
    print("  4. Restart nhanh (không build)")
    print("  5. Xem logs")
    print("  6. Xem trạng thái containers")
    print("  7. Chỉ git pull (không build)")
    print("  8. Thoát")
    print("=" * 50)
    return input("Chọn (1-8): ").strip()


def main():
    print("\n⚠️  Đảm bảo VPN đã được bật trước khi tiếp tục!\n")
    input("Nhấn Enter để tiếp tục...")

    client = connect()

    while True:
        choice = menu()

        if choice == "1":
            deploy_full(client)
        elif choice == "2":
            deploy_fe_only(client)
        elif choice == "3":
            deploy_be_only(client)
        elif choice == "4":
            restart_only(client)
        elif choice == "5":
            show_logs(client)
        elif choice == "6":
            show_status(client)
        elif choice == "7":
            pull_only(client)
        elif choice == "8":
            print("\n👋 Tạm biệt!")
            client.close()
            break
        else:
            print("❌ Lựa chọn không hợp lệ!")

        input("\nNhấn Enter để tiếp tục...")


if __name__ == "__main__":
    main()