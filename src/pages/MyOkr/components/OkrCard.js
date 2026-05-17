"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var material_1 = require("@mui/material");
var icons_material_1 = require("@mui/icons-material");
var api_1 = require("../../../services/api");
var swal_1 = require("../../../utils/swal");
var okr_constants_1 = require("../okr.constants");
var NegotiationChat_1 = require("./NegotiationChat");
var AddCriteriaDialog_1 = require("./AddCriteriaDialog");
var OkrCard = function (_a) {
    var _b, _c, _d, _e;
    var okr = _a.okr, onRefresh = _a.onRefresh;
    var _f = (0, react_1.useState)(false), expanded = _f[0], setExpanded = _f[1];
    var _g = (0, react_1.useState)(null), activeChatId = _g[0], setActiveChatId = _g[1];
    var _h = (0, react_1.useState)(""), chatMessage = _h[0], setChatMessage = _h[1];
    var _j = (0, react_1.useState)(false), chatLoading = _j[0], setChatLoading = _j[1];
    // Self-report state
    var _k = (0, react_1.useState)({}), reportData = _k[0], setReportData = _k[1];
    var _l = (0, react_1.useState)(false), saving = _l[0], setSaving = _l[1];
    // Add KR/SubKR State
    var _m = (0, react_1.useState)(false), openAddDialog = _m[0], setOpenAddDialog = _m[1];
    var _o = (0, react_1.useState)(null), addParentType = _o[0], setAddParentType = _o[1];
    var _p = (0, react_1.useState)(null), addObjectiveId = _p[0], setAddObjectiveId = _p[1];
    var _q = (0, react_1.useState)(null), addKrId = _q[0], setAddKrId = _q[1];
    var _r = (0, react_1.useState)(''), newCriteriaTitle = _r[0], setNewCriteriaTitle = _r[1];
    var _s = (0, react_1.useState)(''), newCriteriaUnitScore = _s[0], setNewCriteriaUnitScore = _s[1];
    var _t = (0, react_1.useState)(''), newCriteriaUnit = _t[0], setNewCriteriaUnit = _t[1];
    var _u = (0, react_1.useState)([]), localStructure = _u[0], setLocalStructure = _u[1];
    var _v = (0, react_1.useState)(false), hasChanges = _v[0], setHasChanges = _v[1];
    var _w = (0, react_1.useState)({}), localComments = _w[0], setLocalComments = _w[1];
    // Edit Criteria State
    var _x = (0, react_1.useState)(false), openEditDialog = _x[0], setOpenEditDialog = _x[1];
    var _y = (0, react_1.useState)(null), editItemInfo = _y[0], setEditItemInfo = _y[1];
    var _z = (0, react_1.useState)(''), editCriteriaTitle = _z[0], setEditCriteriaTitle = _z[1];
    var _0 = (0, react_1.useState)(''), editCriteriaMaxScore = _0[0], setEditCriteriaMaxScore = _0[1];
    var _1 = (0, react_1.useState)(''), editCriteriaUnitScore = _1[0], setEditCriteriaUnitScore = _1[1];
    var _2 = (0, react_1.useState)(''), editCriteriaUnit = _2[0], setEditCriteriaUnit = _2[1];
    // Diff Logic
    var originalStructure = ((_b = okr.proposedChanges) === null || _b === void 0 ? void 0 : _b.originalStructure) || null;
    var findOriginalItem = function (id) {
        if (!originalStructure)
            return null;
        for (var _i = 0, originalStructure_1 = originalStructure; _i < originalStructure_1.length; _i++) {
            var obj = originalStructure_1[_i];
            if (obj.id === id)
                return obj;
            if (obj.items) {
                for (var _a = 0, _b = obj.items; _a < _b.length; _a++) {
                    var kr = _b[_a];
                    if (kr.id === id)
                        return kr;
                    if (kr.items) {
                        for (var _c = 0, _d = kr.items; _c < _d.length; _c++) {
                            var sub = _d[_c];
                            if (sub.id === id)
                                return sub;
                        }
                    }
                }
            }
        }
        return null;
    };
    var hasChanged = function (newItem, oldItem) {
        if (!oldItem)
            return false;
        return String(newItem.title || '').trim() !== String(oldItem.title || '').trim() ||
            Number(newItem.maxScore || 0) !== Number(oldItem.maxScore || 0) ||
            Number(newItem.unitScore || 0) !== Number(oldItem.unitScore || 0) ||
            String(newItem.unit || '').trim() !== String(oldItem.unit || '').trim();
    };
    var renderOldRow = function (oldItem, indent) {
        if (!oldItem || !(okr.status === 'PENDING' || okr.status === 'NEGOTIATING'))
            return null;
        return (<material_1.TableRow sx={{ bgcolor: "#f1f5f9", opacity: 0.7 }}>
        <material_1.TableCell sx={{ pl: indent, textDecoration: "line-through", color: "text.secondary", fontSize: "1rem" }}>{oldItem.id}</material_1.TableCell>
        <material_1.TableCell sx={{ textDecoration: "line-through", color: "text.secondary" }}>[Cũ] {oldItem.title}</material_1.TableCell>
        <material_1.TableCell sx={{ textDecoration: "line-through", color: "text.secondary" }}>{oldItem.maxScore || "—"}</material_1.TableCell>
        <material_1.TableCell sx={{ textDecoration: "line-through", color: "text.secondary" }}>{oldItem.unitScore ? "+".concat(oldItem.unitScore, "/").concat(oldItem.unit || 'đv') : '—'}</material_1.TableCell>
        {canReport && <><material_1.TableCell></material_1.TableCell><material_1.TableCell></material_1.TableCell><material_1.TableCell></material_1.TableCell></>}
        {(okr.status === "SUBMITTED" || okr.status === "COMPLETED") && <><material_1.TableCell></material_1.TableCell><material_1.TableCell></material_1.TableCell><material_1.TableCell></material_1.TableCell></>}
        <material_1.TableCell align="center"></material_1.TableCell>
      </material_1.TableRow>);
    };
    var deletedItems = [];
    if (originalStructure && (okr.status === 'PENDING' || okr.status === 'NEGOTIATING')) {
        var flatten_1 = function (items) {
            var result = [];
            items.forEach(function (i) {
                result.push(i);
                if (i.items)
                    result = result.concat(flatten_1(i.items));
            });
            return result;
        };
        var oldFlat = flatten_1(originalStructure);
        var newFlat_1 = flatten_1(localStructure);
        oldFlat.forEach(function (o) {
            if (!newFlat_1.find(function (n) { return n.id === o.id; })) {
                deletedItems.push(o);
            }
        });
    }
    var isAccepted = okr.status === "ACCEPTED";
    var isSubmitted = okr.status === "SUBMITTED";
    var isCompleted = okr.status === "COMPLETED";
    var isPending = okr.status === "PENDING";
    var isCycleStarted = ((_c = okr.cycle) === null || _c === void 0 ? void 0 : _c.startDate)
        ? new Date(new Date().setHours(0, 0, 0, 0)) >= new Date(new Date(okr.cycle.startDate).setHours(0, 0, 0, 0))
        : true;
    var canReport = isAccepted && isCycleStarted;
    (0, react_1.useEffect)(function () {
        if (okr.selfReportData && typeof okr.selfReportData === "object") {
            setReportData(okr.selfReportData);
        }
        setLocalStructure(Array.isArray(okr.keyResults) ? okr.keyResults : []);
        setHasChanges(false);
    }, [okr.selfReportData, okr.keyResults]);
    var calcTotalScore = function () {
        var total = 0;
        Object.values(reportData).forEach(function (item) {
            total += Number(item.quantity) || 0;
        });
        return total;
    };
    var calcMaxScore = function () {
        var max = 0;
        localStructure.forEach(function (obj) {
            max += Number(obj.maxScore) || 0;
        });
        return max;
    };
    var calcObjectiveScore = function (obj) {
        var _a;
        var total = 0;
        var selfReport = okr.selfReportData || {};
        (_a = obj.items) === null || _a === void 0 ? void 0 : _a.forEach(function (kr) {
            var _a, _b;
            var krKey = "".concat(obj.id, "-").concat(kr.id);
            total += Number((_a = selfReport[krKey]) === null || _a === void 0 ? void 0 : _a.score) || 0;
            (_b = kr.items) === null || _b === void 0 ? void 0 : _b.forEach(function (sub) {
                var _a;
                var subKey = "".concat(obj.id, "-").concat(kr.id, "-").concat(sub.id);
                total += Number((_a = selfReport[subKey]) === null || _a === void 0 ? void 0 : _a.score) || 0;
            });
        });
        var max = Number(obj.maxScore) || 0;
        return max > 0 ? Math.min(total, max) : total;
    };
    var handleOpenAddDialog = function (type, objId, krId) {
        setAddParentType(type);
        setAddObjectiveId(objId);
        setAddKrId(krId || null);
        setNewCriteriaTitle('');
        setNewCriteriaUnitScore('');
        setNewCriteriaUnit('');
        setOpenAddDialog(true);
    };
    var handleSaveNewCriteria = function () {
        var _a;
        if (!newCriteriaTitle.trim()) {
            (0, swal_1.showError)("Lỗi", "Vui lòng nhập nội dung.");
            return;
        }
        var newStructure = JSON.parse(JSON.stringify(localStructure));
        var generatedId = "";
        if (addParentType === 'KR') {
            var obj = newStructure.find(function (o) { return o.id === addObjectiveId; });
            if (obj) {
                if (!obj.items)
                    obj.items = [];
                var lastItem = obj.items[obj.items.length - 1];
                if (lastItem && lastItem.id) {
                    var parts = String(lastItem.id).split('.');
                    if (parts.length > 1) {
                        var lastNum = parseInt(parts[parts.length - 1], 10);
                        parts[parts.length - 1] = isNaN(lastNum) ? "1" : String(lastNum + 1);
                        generatedId = parts.join('.');
                    }
                    else {
                        var lastNum = parseInt(lastItem.id, 10);
                        if (!isNaN(lastNum)) {
                            generatedId = String(lastNum + 1);
                        }
                        else {
                            generatedId = "".concat(lastItem.id, ".1");
                        }
                    }
                }
                else {
                    generatedId = "".concat(obj.id, ".1");
                }
                var newItem = {
                    id: generatedId,
                    title: newCriteriaTitle,
                    unitScore: Number(newCriteriaUnitScore) || 0,
                    unit: newCriteriaUnit || 'đv',
                    isNew: true,
                    items: []
                };
                obj.items.push(newItem);
            }
        }
        else if (addParentType === 'SUBKR') {
            var obj = newStructure.find(function (o) { return o.id === addObjectiveId; });
            if (obj) {
                var kr = (_a = obj.items) === null || _a === void 0 ? void 0 : _a.find(function (k) { return k.id === addKrId; });
                if (kr) {
                    if (!kr.items)
                        kr.items = [];
                    var lastItem = kr.items[kr.items.length - 1];
                    if (lastItem && lastItem.id) {
                        var parts = String(lastItem.id).split('.');
                        if (parts.length > 1) {
                            var lastNum = parseInt(parts[parts.length - 1], 10);
                            parts[parts.length - 1] = isNaN(lastNum) ? "1" : String(lastNum + 1);
                            generatedId = parts.join('.');
                        }
                        else {
                            generatedId = "".concat(lastItem.id, ".1");
                        }
                    }
                    else {
                        generatedId = "".concat(kr.id, ".1");
                    }
                    var newItem = {
                        id: generatedId,
                        title: newCriteriaTitle,
                        unitScore: Number(newCriteriaUnitScore) || 0,
                        unit: newCriteriaUnit || 'đv',
                        isNew: true,
                        items: []
                    };
                    kr.items.push(newItem);
                }
            }
        }
        setLocalStructure(newStructure);
        setHasChanges(true);
        setOpenAddDialog(false);
    };
    var handleDeleteItem = function (objId, krId, subId) {
        var _a;
        var newStructure = JSON.parse(JSON.stringify(localStructure));
        if (subId && krId) {
            var obj = newStructure.find(function (o) { return o.id === objId; });
            if (obj) {
                var kr = (_a = obj.items) === null || _a === void 0 ? void 0 : _a.find(function (k) { return k.id === krId; });
                if (kr && kr.items) {
                    kr.items = kr.items.filter(function (s) { return s.id !== subId; });
                }
            }
        }
        else if (krId) {
            var obj = newStructure.find(function (o) { return o.id === objId; });
            if (obj && obj.items) {
                obj.items = obj.items.filter(function (k) { return k.id !== krId; });
            }
        }
        setLocalStructure(newStructure);
        setHasChanges(true);
    };
    var handleOpenEditDialog = function (type, objId, krId, subId) {
        var _a, _b, _c, _d, _e;
        var item = null;
        var obj = localStructure.find(function (o) { return o.id === objId; });
        if (type === 'OBJ') {
            item = obj;
        }
        else if (type === 'KR') {
            item = (_a = obj === null || obj === void 0 ? void 0 : obj.items) === null || _a === void 0 ? void 0 : _a.find(function (k) { return k.id === krId; });
        }
        else if (type === 'SUBKR') {
            var kr = (_b = obj === null || obj === void 0 ? void 0 : obj.items) === null || _b === void 0 ? void 0 : _b.find(function (k) { return k.id === krId; });
            item = (_c = kr === null || kr === void 0 ? void 0 : kr.items) === null || _c === void 0 ? void 0 : _c.find(function (s) { return s.id === subId; });
        }
        if (item) {
            setEditItemInfo({ type: type, objId: objId, krId: krId, subId: subId });
            setEditCriteriaTitle(item.title || '');
            setEditCriteriaMaxScore(String((_d = item.maxScore) !== null && _d !== void 0 ? _d : ''));
            setEditCriteriaUnitScore(String((_e = item.unitScore) !== null && _e !== void 0 ? _e : ''));
            setEditCriteriaUnit(item.unit || '');
            setOpenEditDialog(true);
        }
    };
    var handleSaveEditCriteria = function () {
        var _a, _b, _c;
        if (!editCriteriaTitle.trim()) {
            (0, swal_1.showError)("Lỗi", "Vui lòng nhập nội dung.");
            return;
        }
        var newStructure = JSON.parse(JSON.stringify(localStructure));
        var obj = newStructure.find(function (o) { return o.id === (editItemInfo === null || editItemInfo === void 0 ? void 0 : editItemInfo.objId); });
        var targetItem = null;
        if ((editItemInfo === null || editItemInfo === void 0 ? void 0 : editItemInfo.type) === 'OBJ') {
            targetItem = obj;
        }
        else if ((editItemInfo === null || editItemInfo === void 0 ? void 0 : editItemInfo.type) === 'KR') {
            targetItem = (_a = obj === null || obj === void 0 ? void 0 : obj.items) === null || _a === void 0 ? void 0 : _a.find(function (k) { return k.id === editItemInfo.krId; });
        }
        else if ((editItemInfo === null || editItemInfo === void 0 ? void 0 : editItemInfo.type) === 'SUBKR') {
            var kr = (_b = obj === null || obj === void 0 ? void 0 : obj.items) === null || _b === void 0 ? void 0 : _b.find(function (k) { return k.id === editItemInfo.krId; });
            targetItem = (_c = kr === null || kr === void 0 ? void 0 : kr.items) === null || _c === void 0 ? void 0 : _c.find(function (s) { return s.id === editItemInfo.subId; });
        }
        if (targetItem) {
            targetItem.title = editCriteriaTitle;
            targetItem.maxScore = Number(editCriteriaMaxScore) || 0;
            targetItem.unitScore = Number(editCriteriaUnitScore) || 0;
            targetItem.unit = editCriteriaUnit;
            targetItem.isEdited = true;
        }
        setLocalStructure(newStructure);
        setHasChanges(true);
        setOpenEditDialog(false);
    };
    var handleSubmitChanges = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, api_1.api.put("/okrs/".concat(okr.id, "/structure"), {
                            keyResults: localStructure,
                            localComments: Object.keys(localComments).length > 0 ? localComments : undefined
                        })];
                case 1:
                    _a.sent();
                    setHasChanges(false);
                    setLocalComments({});
                    onRefresh();
                    (0, swal_1.showSuccess)("Thành công", "Đã gửi cấu trúc mới.");
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    (0, swal_1.showError)("Lỗi", "Không thể cập nhật cấu trúc.");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleAccept = function () { return __awaiter(void 0, void 0, void 0, function () {
        var ok, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, swal_1.confirmAction)({
                        title: "Chấp nhận OKR?",
                        text: "Sau khi chấp nhận, bạn sẽ bắt đầu tự khai điểm.",
                        icon: "question",
                        confirmText: "Đồng ý chấp nhận",
                        confirmColor: "#16a34a",
                    })];
                case 1:
                    ok = _a.sent();
                    if (!ok)
                        return [2 /*return*/];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, api_1.api.put("/okrs/".concat(okr.id, "/accept"))];
                case 3:
                    _a.sent();
                    onRefresh();
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error(error_2);
                    (0, swal_1.showError)("Lỗi", "Có lỗi xảy ra khi chấp nhận OKR.");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleSendChat = function (itemId) { return __awaiter(void 0, void 0, void 0, function () {
        var newMessage;
        return __generator(this, function (_a) {
            if (!chatMessage.trim())
                return [2 /*return*/];
            newMessage = {
                message: chatMessage,
                sender: "USER",
                createdAt: new Date().toISOString(),
            };
            setLocalComments(function (prev) {
                var _a;
                return (__assign(__assign({}, prev), (_a = {}, _a[itemId] = __spreadArray(__spreadArray([], (prev[itemId] || []), true), [newMessage], false), _a)));
            });
            setChatMessage("");
            setHasChanges(true);
            return [2 /*return*/];
        });
    }); };
    var updateReport = function (krId, field, value) {
        setReportData(function (prev) {
            var _a, _b;
            return (__assign(__assign({}, prev), (_a = {}, _a[krId] = __assign(__assign({}, prev[krId]), (_b = {}, _b[field] = field === "quantity" ? Math.max(0, Number(value) || 0) : value, _b)), _a)));
        });
    };
    var handleSubmitReport = function () { return __awaiter(void 0, void 0, void 0, function () {
        var ok, enrichedReport, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, swal_1.confirmAction)({
                        title: "Nộp bài tự khai?",
                        text: "Sau khi nộp, bài sẽ được gửi cho Trưởng khoa duyệt. Bạn chắc chắn chứ?",
                        icon: "question",
                        confirmText: "Nộp bài",
                        confirmColor: "#1976d2",
                    })];
                case 1:
                    ok = _a.sent();
                    if (!ok)
                        return [2 /*return*/];
                    setSaving(true);
                    enrichedReport = {};
                    localStructure.forEach(function (obj) {
                        var _a;
                        (_a = obj.items) === null || _a === void 0 ? void 0 : _a.forEach(function (kr) {
                            var _a, _b, _c;
                            var key = "".concat(obj.id, "-").concat(kr.id);
                            var qty = ((_a = reportData[key]) === null || _a === void 0 ? void 0 : _a.quantity) || 0;
                            var unitScore = Number(kr.unitScore) || 0;
                            var score = unitScore > 0 ? qty * unitScore : qty;
                            enrichedReport[key] = {
                                quantity: qty,
                                evidence: ((_b = reportData[key]) === null || _b === void 0 ? void 0 : _b.evidence) || "",
                                score: Math.min(score, Number(kr.maxScore) || Infinity),
                                krTitle: kr.title,
                                objTitle: obj.title,
                            };
                            (_c = kr.items) === null || _c === void 0 ? void 0 : _c.forEach(function (sub) {
                                var _a, _b;
                                var subKey = "".concat(obj.id, "-").concat(kr.id, "-").concat(sub.id);
                                var subQty = ((_a = reportData[subKey]) === null || _a === void 0 ? void 0 : _a.quantity) || 0;
                                var subUnitScore = Number(sub.unitScore) || 0;
                                var subScore = subUnitScore > 0 ? subQty * subUnitScore : subQty;
                                enrichedReport[subKey] = {
                                    quantity: subQty,
                                    evidence: ((_b = reportData[subKey]) === null || _b === void 0 ? void 0 : _b.evidence) || "",
                                    score: Math.min(subScore, Number(sub.maxScore) || Infinity),
                                    krTitle: sub.title,
                                    objTitle: obj.title,
                                };
                            });
                        });
                    });
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, 5, 6]);
                    return [4 /*yield*/, api_1.api.put("/okrs/".concat(okr.id, "/self-report"), {
                            selfReportData: enrichedReport,
                        })];
                case 3:
                    _a.sent();
                    (0, swal_1.showSuccess)("Thành công!", "Đã nộp bài tự khai thành công.");
                    onRefresh();
                    return [3 /*break*/, 6];
                case 4:
                    error_3 = _a.sent();
                    console.error(error_3);
                    (0, swal_1.showError)("Lỗi", "Có lỗi xảy ra khi nộp bài.");
                    return [3 /*break*/, 6];
                case 5:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var totalSelfScore = calcTotalScore();
    var maxScore = calcMaxScore();
    var progressPercent = maxScore > 0 ? Math.min((totalSelfScore / maxScore) * 100, 100) : 0;
    return (<material_1.Paper sx={{
            mb: 3,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            borderRadius: 2,
        }}>
      {/* Card Header */}
      <material_1.Box sx={{
            display: "flex",
            alignItems: "center",
            p: 2,
            bgcolor: "#f8fafc",
        }}>
        <material_1.Box sx={{ flex: 1 }}>
          <material_1.Typography variant="h6" fontWeight="bold" color="#1e3a8a">
            {okr.objective}
          </material_1.Typography>
          <material_1.Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
            <material_1.Chip label={isAccepted && !isCycleStarted ? "Chờ kỳ bắt đầu" : (((_d = okr_constants_1.statusConfig[okr.status]) === null || _d === void 0 ? void 0 : _d.label) || okr.status)} color={isAccepted && !isCycleStarted ? "warning" : (((_e = okr_constants_1.statusConfig[okr.status]) === null || _e === void 0 ? void 0 : _e.color) || "default")} size="small"/>
            {okr.deadline && (<material_1.Chip label={"Deadline: ".concat(new Date(okr.deadline).toLocaleDateString("vi-VN"))} size="small" variant="outlined"/>)}
            {(isAccepted || isSubmitted || isCompleted) && (<material_1.Chip label={"\u0110i\u1EC3m: ".concat(okr.totalScore || totalSelfScore, "/").concat(maxScore)} size="small" color="primary" variant="outlined"/>)}
          </material_1.Box>
        </material_1.Box>
        <material_1.Box sx={{ display: "flex", gap: 1 }}>
          <material_1.Button size="small" variant="outlined" color="primary" onClick={function () { return setExpanded(!expanded); }} endIcon={expanded ? <icons_material_1.ExpandLess /> : <icons_material_1.ExpandMore />}>
            {expanded ? "Thu gọn" : "Xem chi tiết"}
          </material_1.Button>
        </material_1.Box>
      </material_1.Box>

      {(canReport || isSubmitted || isCompleted) && (<material_1.Box sx={{ px: 2, pb: 1 }}>
          <material_1.LinearProgress variant="determinate" value={progressPercent} sx={{ height: 8, borderRadius: 4 }}/>
          <material_1.Typography variant="caption" color="text.secondary">
            {progressPercent.toFixed(0)}% hoàn thành
          </material_1.Typography>
        </material_1.Box>)}

      {/* Expanded Dialog */}
      <material_1.Dialog open={expanded} onClose={function () { return setExpanded(false); }} maxWidth="xl" fullWidth PaperProps={{ sx: { minHeight: '80vh', maxHeight: '90vh' } }}>
        <material_1.DialogTitle sx={{ bgcolor: "#1e3a8a", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <material_1.Box>Chi tiết OKR: {okr.objective}</material_1.Box>
          <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {(isPending || okr.status === 'NEGOTIATING') && hasChanges && (<material_1.Button variant="contained" color="success" size="small" onClick={handleSubmitChanges} startIcon={<icons_material_1.Save />}>
                Gửi thay đổi
              </material_1.Button>)}
            <material_1.IconButton onClick={function () { return setExpanded(false); }} sx={{ color: "white" }}>
              <icons_material_1.Close />
            </material_1.IconButton>
          </material_1.Box>
        </material_1.DialogTitle>
        <material_1.DialogContent dividers sx={{ p: 0 }}>
          {isAccepted && !isCycleStarted && (<material_1.Box sx={{ p: 2, bgcolor: "#fffbeb" }}>
              <material_1.Alert severity="warning">
                Kỳ đánh giá chưa bắt đầu (Dự kiến bắt đầu từ <strong>{new Date(okr.cycle.startDate).toLocaleDateString('vi-VN')}</strong>). Bạn chưa thể tự khai điểm lúc này.
              </material_1.Alert>
            </material_1.Box>)}
          <material_1.Divider />
          <material_1.TableContainer>
            <material_1.Table size="small">
              <material_1.TableHead sx={{ bgcolor: "#1e3a8a" }}>
                <material_1.TableRow>
                  <material_1.TableCell sx={{ color: "white", fontWeight: "bold", width: "5%" }}>STT</material_1.TableCell>
                  <material_1.TableCell sx={{ color: "white", fontWeight: "bold", width: "30%" }}>Nội dung</material_1.TableCell>
                  <material_1.TableCell sx={{ color: "white", fontWeight: "bold", width: "10%" }}>Điểm tối đa</material_1.TableCell>
                  <material_1.TableCell sx={{ color: "white", fontWeight: "bold", width: "12%" }}>Điểm/đơn vị</material_1.TableCell>
                  {canReport && (<>
                      <material_1.TableCell sx={{ color: "white", fontWeight: "bold", width: "12%" }}>Số lượng tự khai</material_1.TableCell>
                      <material_1.TableCell sx={{ color: "white", fontWeight: "bold", width: "10%" }}>Quy đổi</material_1.TableCell>
                      <material_1.TableCell sx={{ color: "white", fontWeight: "bold", width: "21%" }}>Minh chứng</material_1.TableCell>
                    </>)}
                  {(isSubmitted || isCompleted) && (<>
                      <material_1.TableCell sx={{ color: "white", fontWeight: "bold", width: "10%" }}>Số lượng tự khai</material_1.TableCell>
                      <material_1.TableCell sx={{ color: "white", fontWeight: "bold", width: "10%" }}>Điểm khai</material_1.TableCell>
                      <material_1.TableCell sx={{ color: "white", fontWeight: "bold", width: "10%" }}>Tổng điểm nhiệm vụ</material_1.TableCell>
                    </>)}
                  {(isPending || okr.status === 'NEGOTIATING') && (<material_1.TableCell sx={{ color: "white", fontWeight: "bold", width: "10%", textAlign: "center" }}>Đàm phán</material_1.TableCell>)}
                </material_1.TableRow>
              </material_1.TableHead>
              <material_1.TableBody>
                {localStructure.map(function (obj, oIndex) {
            var _a, _b, _c, _d, _e;
            var oldObj = findOriginalItem(obj.id);
            var isObjChanged = hasChanged(obj, oldObj);
            return (<react_1.default.Fragment key={obj.id || oIndex}>
                      {isObjChanged && renderOldRow(oldObj, 2)}
                      <material_1.TableRow sx={{ bgcolor: isObjChanged ? "#fef08a" : "#dbeafe" }}>
                        <material_1.TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>{obj.id}</material_1.TableCell>
                        <material_1.TableCell sx={{ fontWeight: "bold" }}>{isObjChanged ? '[Mới] ' : ''}{obj.title}</material_1.TableCell>
                        <material_1.TableCell sx={{ fontWeight: "bold" }}>{obj.maxScore}</material_1.TableCell>
                        <material_1.TableCell></material_1.TableCell>
                        {canReport && <><material_1.TableCell></material_1.TableCell><material_1.TableCell></material_1.TableCell><material_1.TableCell></material_1.TableCell></>}
                        {(isSubmitted || isCompleted) && (<><material_1.TableCell></material_1.TableCell><material_1.TableCell></material_1.TableCell>
                            <material_1.TableCell sx={{ fontWeight: "bold", color: "#15803d", fontSize: "1rem" }}>
                              {calcObjectiveScore(obj)} / {obj.maxScore || 0}
                            </material_1.TableCell>
                          </>)}
                        {(isPending || okr.status === 'NEGOTIATING') && (<material_1.TableCell align="center">
                            <material_1.Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <material_1.IconButton size="small" onClick={function () { return handleOpenAddDialog('KR', obj.id); }} title="Thêm tiêu chí">
                                <icons_material_1.Add fontSize="small" color="success"/>
                              </material_1.IconButton>
                              <material_1.IconButton size="small" onClick={function () { return handleOpenEditDialog('OBJ', obj.id); }} title="Chỉnh sửa">
                                <icons_material_1.Edit fontSize="small" color="info"/>
                              </material_1.IconButton>
                              <material_1.IconButton size="small" onClick={function () { return setActiveChatId(activeChatId === obj.id ? null : obj.id); }}>
                                <icons_material_1.Comment fontSize="small" color={(((_b = (_a = okr.proposedChanges) === null || _a === void 0 ? void 0 : _a[obj.id]) === null || _b === void 0 ? void 0 : _b.length) > 0 || ((_c = localComments[obj.id]) === null || _c === void 0 ? void 0 : _c.length) > 0) ? "primary" : "inherit"}/>
                              </material_1.IconButton>
                            </material_1.Box>
                          </material_1.TableCell>)}
                      </material_1.TableRow>
                      <NegotiationChat_1.default itemId={obj.id} activeChatId={activeChatId} history={__spreadArray(__spreadArray([], (((_d = okr.proposedChanges) === null || _d === void 0 ? void 0 : _d[obj.id]) || []), true), (localComments[obj.id] || []), true)} chatMessage={chatMessage} setChatMessage={setChatMessage} onSend={handleSendChat} loading={chatLoading} colSpan={11} status={okr.status}/>

                      {(_e = obj.items) === null || _e === void 0 ? void 0 : _e.map(function (kr, kIndex) {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    var krKey = "".concat(obj.id, "-").concat(kr.id);
                    var krQty = ((_a = reportData[krKey]) === null || _a === void 0 ? void 0 : _a.quantity) || 0;
                    var krUnitScore = Number(kr.unitScore) || 0;
                    var krCalcScore = krUnitScore > 0 ? krQty * krUnitScore : krQty;
                    var existingReport = (_b = okr.selfReportData) === null || _b === void 0 ? void 0 : _b[krKey];
                    var oldKr = findOriginalItem(kr.id);
                    var isKrChanged = hasChanged(kr, oldKr);
                    var isKrNew = !oldKr;
                    return (<react_1.default.Fragment key={"".concat(oIndex, "-").concat(kIndex)}>
                            {isKrChanged && renderOldRow(oldKr, 3)}
                            <material_1.TableRow sx={{ bgcolor: (isKrNew || isKrChanged || kr.isEdited) ? "#fef08a" : "#f8fafc" }}>
                              <material_1.TableCell sx={{ pl: 3, fontWeight: (isKrNew || isKrChanged || kr.isEdited) ? "bold" : "normal" }}>{kr.id}</material_1.TableCell>
                              <material_1.TableCell sx={{ fontWeight: (isKrNew || isKrChanged || kr.isEdited) ? "bold" : "normal" }}>{isKrChanged ? '[Mới] ' : ''}{kr.title}</material_1.TableCell>
                              <material_1.TableCell sx={{ fontWeight: (isKrNew || isKrChanged || kr.isEdited) ? "bold" : "normal" }}>{kr.maxScore || "—"}</material_1.TableCell>
                              <material_1.TableCell>
                                {kr.unitScore ? (<material_1.Chip label={"+".concat(kr.unitScore, "/").concat(kr.unit || "đv")} size="small" color="primary" variant="outlined"/>) : "—"}
                              </material_1.TableCell>
                              {canReport && (<>
                                  <material_1.TableCell>
                                    <material_1.TextField size="small" type="number" value={krQty || ""} onChange={function (e) { return updateReport(krKey, "quantity", e.target.value); }} inputProps={{ min: 0, style: { textAlign: "center" } }} sx={{ width: 80 }}/>
                                  </material_1.TableCell>
                                  <material_1.TableCell sx={{ fontWeight: "bold", color: "#2563eb" }}>{krCalcScore.toFixed(1)}</material_1.TableCell>
                                  <material_1.TableCell>
                                    <material_1.TextField size="small" fullWidth placeholder="Link minh chứng..." value={((_c = reportData[krKey]) === null || _c === void 0 ? void 0 : _c.evidence) || ""} onChange={function (e) { return updateReport(krKey, "evidence", e.target.value); }}/>
                                  </material_1.TableCell>
                                </>)}
                              {(isSubmitted || isCompleted) && (<>
                                  <material_1.TableCell>{(existingReport === null || existingReport === void 0 ? void 0 : existingReport.quantity) || 0}</material_1.TableCell>
                                  <material_1.TableCell sx={{ fontWeight: "bold", color: "#2563eb" }}>{(existingReport === null || existingReport === void 0 ? void 0 : existingReport.score) || 0}</material_1.TableCell>
                                  <material_1.TableCell></material_1.TableCell>
                                </>)}
                              {(isPending || okr.status === 'NEGOTIATING') && (<material_1.TableCell align="center">
                                  <material_1.Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                    <material_1.IconButton size="small" onClick={function () { return handleOpenAddDialog('SUBKR', obj.id, kr.id); }} title="Thêm tiêu chí con">
                                      <icons_material_1.Add fontSize="small" color="success"/>
                                    </material_1.IconButton>
                                    <material_1.IconButton size="small" onClick={function () { return handleOpenEditDialog('KR', obj.id, kr.id); }} title="Chỉnh sửa">
                                      <icons_material_1.Edit fontSize="small" color="info"/>
                                    </material_1.IconButton>
                                    <material_1.IconButton size="small" onClick={function () { return setActiveChatId(activeChatId === kr.id ? null : kr.id); }}>
                                      <icons_material_1.Comment fontSize="small" color={(((_e = (_d = okr.proposedChanges) === null || _d === void 0 ? void 0 : _d[kr.id]) === null || _e === void 0 ? void 0 : _e.length) > 0 || ((_f = localComments[kr.id]) === null || _f === void 0 ? void 0 : _f.length) > 0) ? "primary" : "inherit"}/>
                                    </material_1.IconButton>
                                    <material_1.IconButton size="small" onClick={function () { return handleDeleteItem(obj.id, kr.id); }} title="Xóa tiêu chí">
                                      <icons_material_1.Delete fontSize="small" color="error"/>
                                    </material_1.IconButton>
                                  </material_1.Box>
                                </material_1.TableCell>)}
                            </material_1.TableRow>
                            <NegotiationChat_1.default itemId={kr.id} activeChatId={activeChatId} history={__spreadArray(__spreadArray([], (((_g = okr.proposedChanges) === null || _g === void 0 ? void 0 : _g[kr.id]) || []), true), (localComments[kr.id] || []), true)} chatMessage={chatMessage} setChatMessage={setChatMessage} onSend={handleSendChat} loading={chatLoading} colSpan={11} status={okr.status}/>

                            {(_h = kr.items) === null || _h === void 0 ? void 0 : _h.map(function (sub, sIndex) {
                            var _a, _b, _c, _d, _e, _f, _g;
                            var subKey = "".concat(obj.id, "-").concat(kr.id, "-").concat(sub.id);
                            var subQty = ((_a = reportData[subKey]) === null || _a === void 0 ? void 0 : _a.quantity) || 0;
                            var subUnitScore = Number(sub.unitScore) || 0;
                            var subCalcScore = subUnitScore > 0 ? subQty * subUnitScore : subQty;
                            var existingSub = (_b = okr.selfReportData) === null || _b === void 0 ? void 0 : _b[subKey];
                            var oldSub = findOriginalItem(sub.id);
                            var isSubChanged = hasChanged(sub, oldSub);
                            var isSubNew = !oldSub;
                            return (<react_1.default.Fragment key={"".concat(oIndex, "-").concat(kIndex, "-").concat(sIndex)}>
                                  {isSubChanged && renderOldRow(oldSub, 6)}
                                  <material_1.TableRow sx={{ bgcolor: (isSubNew || isSubChanged || sub.isEdited) ? "#fef08a" : "inherit" }}>
                                    <material_1.TableCell sx={{ pl: 6, fontSize: "0.85rem", fontWeight: (isSubNew || isSubChanged || sub.isEdited) ? "bold" : "normal" }}>{sub.id}</material_1.TableCell>
                                    <material_1.TableCell sx={{ fontSize: "0.9rem", fontWeight: (isSubNew || isSubChanged || sub.isEdited) ? "bold" : "normal" }}>{isSubChanged ? '[Mới] ' : ''}{sub.title}</material_1.TableCell>
                                    <material_1.TableCell sx={{ fontWeight: (isSubNew || isSubChanged || sub.isEdited) ? "bold" : "normal" }}>{sub.maxScore || "—"}</material_1.TableCell>
                                    <material_1.TableCell>
                                      {sub.unitScore ? (<material_1.Chip label={"+".concat(sub.unitScore, "/").concat(sub.unit || "đv")} size="small" variant="outlined"/>) : "—"}
                                    </material_1.TableCell>
                                    {canReport && (<>
                                        <material_1.TableCell>
                                          <material_1.TextField size="small" type="number" value={subQty || ""} onChange={function (e) { return updateReport(subKey, "quantity", e.target.value); }} inputProps={{ min: 0, style: { textAlign: "center" } }} sx={{ width: 80 }}/>
                                        </material_1.TableCell>
                                        <material_1.TableCell sx={{ fontWeight: "bold", color: "#2563eb" }}>{subCalcScore.toFixed(1)}</material_1.TableCell>
                                        <material_1.TableCell>
                                          <material_1.TextField size="small" fullWidth placeholder="Link..." value={((_c = reportData[subKey]) === null || _c === void 0 ? void 0 : _c.evidence) || ""} onChange={function (e) { return updateReport(subKey, "evidence", e.target.value); }}/>
                                        </material_1.TableCell>
                                      </>)}
                                    {(isSubmitted || isCompleted) && (<>
                                        <material_1.TableCell>{(existingSub === null || existingSub === void 0 ? void 0 : existingSub.quantity) || 0}</material_1.TableCell>
                                        <material_1.TableCell sx={{ fontWeight: "bold", color: "#2563eb" }}>{(existingSub === null || existingSub === void 0 ? void 0 : existingSub.score) || 0}</material_1.TableCell>
                                        <material_1.TableCell></material_1.TableCell>
                                      </>)}
                                    {(isPending || okr.status === 'NEGOTIATING') && (<material_1.TableCell align="center">
                                        <material_1.Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                          <material_1.IconButton size="small" onClick={function () { return handleOpenEditDialog('SUBKR', obj.id, kr.id, sub.id); }} title="Chỉnh sửa">
                                            <icons_material_1.Edit fontSize="small" color="info"/>
                                          </material_1.IconButton>
                                          <material_1.IconButton size="small" onClick={function () { return setActiveChatId(activeChatId === sub.id ? null : sub.id); }}>
                                            <icons_material_1.Comment fontSize="small" color={(((_e = (_d = okr.proposedChanges) === null || _d === void 0 ? void 0 : _d[sub.id]) === null || _e === void 0 ? void 0 : _e.length) > 0 || ((_f = localComments[sub.id]) === null || _f === void 0 ? void 0 : _f.length) > 0) ? "primary" : "inherit"}/>
                                          </material_1.IconButton>
                                          <material_1.IconButton size="small" onClick={function () { return handleDeleteItem(obj.id, kr.id, sub.id); }} title="Xóa tiêu chí con">
                                            <icons_material_1.Delete fontSize="small" color="error"/>
                                          </material_1.IconButton>
                                        </material_1.Box>
                                      </material_1.TableCell>)}
                                  </material_1.TableRow>
                                  <NegotiationChat_1.default itemId={sub.id} activeChatId={activeChatId} history={__spreadArray(__spreadArray([], (((_g = okr.proposedChanges) === null || _g === void 0 ? void 0 : _g[sub.id]) || []), true), (localComments[sub.id] || []), true)} chatMessage={chatMessage} setChatMessage={setChatMessage} onSend={handleSendChat} loading={chatLoading} colSpan={11} status={okr.status}/>
                                </react_1.default.Fragment>);
                        })}
                          </react_1.default.Fragment>);
                })}
                    </react_1.default.Fragment>);
        })}

                {/* Deleted items at the end */}
                {deletedItems.length > 0 && (<>
                    <material_1.TableRow>
                      <material_1.TableCell colSpan={isSubmitted || isCompleted ? 7 : canReport ? 7 : 5} sx={{ bgcolor: "#fee2e2", fontWeight: "bold", textAlign: "center", color: "#b91c1c" }}>
                        Các tiêu chí đã bị xóa
                      </material_1.TableCell>
                    </material_1.TableRow>
                    {deletedItems.map(function (delItem, idx) { return (<material_1.TableRow key={"del-".concat(idx)} sx={{ bgcolor: "#fef2f2" }}>
                        <material_1.TableCell sx={{ pl: delItem.id.split('.').length === 1 ? 2 : delItem.id.split('.').length === 2 ? 4 : 8, textDecoration: "line-through", color: "error.main" }}>{delItem.id}</material_1.TableCell>
                        <material_1.TableCell sx={{ textDecoration: "line-through", color: "error.main" }}>{delItem.title}</material_1.TableCell>
                        <material_1.TableCell sx={{ textDecoration: "line-through", color: "error.main" }}>{delItem.maxScore || "—"}</material_1.TableCell>
                        <material_1.TableCell sx={{ textDecoration: "line-through", color: "error.main" }}>{delItem.unitScore ? "+".concat(delItem.unitScore, "/").concat(delItem.unit || 'đv') : '—'}</material_1.TableCell>
                        {canReport && <><material_1.TableCell></material_1.TableCell><material_1.TableCell></material_1.TableCell><material_1.TableCell></material_1.TableCell></>}
                        {(okr.status === "SUBMITTED" || okr.status === "COMPLETED") && <><material_1.TableCell></material_1.TableCell><material_1.TableCell></material_1.TableCell><material_1.TableCell></material_1.TableCell></>}
                        <material_1.TableCell align="center"></material_1.TableCell>
                      </material_1.TableRow>); })}
                  </>)}
              </material_1.TableBody>
            </material_1.Table>
          </material_1.TableContainer>

          {(isPending || okr.status === 'NEGOTIATING') && (<material_1.Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", bgcolor: "#f1f5f9" }}>
              <material_1.Button variant="contained" color="success" startIcon={<icons_material_1.Check />} onClick={handleAccept}>Tôi đồng ý Chấp nhận OKR này</material_1.Button>
            </material_1.Box>)}

          {canReport && (<material_1.Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 2, bgcolor: "#f1f5f9" }}>
              <material_1.Typography variant="body1" sx={{ flexGrow: 1, pt: 1 }}>
                <strong>Tổng điểm tự khai: {totalSelfScore.toFixed(1)}</strong> / {maxScore} điểm
              </material_1.Typography>
              <material_1.Button variant="contained" startIcon={<icons_material_1.Send />} onClick={handleSubmitReport} disabled={saving}>
                {saving ? "Đang nộp..." : "Nộp bài tự khai"}
              </material_1.Button>
            </material_1.Box>)}

          {isCompleted && (<material_1.Box sx={{ p: 2, bgcolor: "#f0fdf4" }}>
              <material_1.Alert severity="success">
                <strong>Điểm cuối cùng: {okr.totalScore} điểm</strong> — Đã được Trưởng khoa duyệt.
              </material_1.Alert>
            </material_1.Box>)}
        </material_1.DialogContent>
      </material_1.Dialog>

      <AddCriteriaDialog_1.default open={openAddDialog} onClose={function () { return setOpenAddDialog(false); }} onSave={handleSaveNewCriteria} parentType={addParentType} title={newCriteriaTitle} setTitle={setNewCriteriaTitle} unitScore={newCriteriaUnitScore} setUnitScore={setNewCriteriaUnitScore} unit={newCriteriaUnit} setUnit={setNewCriteriaUnit}/>

      {/* Dialog Sửa Tiêu chí */}
      <material_1.Dialog open={openEditDialog} onClose={function () { return setOpenEditDialog(false); }} maxWidth="sm" fullWidth>
        <material_1.DialogTitle>Chỉnh sửa Tiêu chí</material_1.DialogTitle>
        <material_1.DialogContent dividers>
          <material_1.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <material_1.TextField label="Nội dung tiêu chí" fullWidth value={editCriteriaTitle} onChange={function (e) { return setEditCriteriaTitle(e.target.value); }}/>
            <material_1.TextField label="Điểm tối đa" type="number" fullWidth value={editCriteriaMaxScore} onChange={function (e) { return setEditCriteriaMaxScore(e.target.value); }}/>
            <material_1.Box sx={{ display: 'flex', gap: 2 }}>
              <material_1.TextField label="Điểm / Đơn vị" type="number" fullWidth value={editCriteriaUnitScore} onChange={function (e) { return setEditCriteriaUnitScore(e.target.value); }}/>
              <material_1.TextField label="Đơn vị tính" fullWidth value={editCriteriaUnit} onChange={function (e) { return setEditCriteriaUnit(e.target.value); }} placeholder="VD: bài, đv, giờ..."/>
            </material_1.Box>
          </material_1.Box>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={function () { return setOpenEditDialog(false); }}>Hủy</material_1.Button>
          <material_1.Button variant="contained" onClick={handleSaveEditCriteria}>Lưu thay đổi</material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
    </material_1.Paper>);
};
exports.default = OkrCard;
