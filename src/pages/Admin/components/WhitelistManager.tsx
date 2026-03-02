import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Add, Delete, Info } from '@mui/icons-material';

import { api } from '../../../services/api';
import type { Domain } from '../../../types';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

export default function WhitelistManager() {
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });
  const [domains, setDomains] = useState<Domain[]>([]);
  const [domainInput, setDomainInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await api.get('/admin/domains');
      const data = response.data?.domains || response.data || [];
      setDomains(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleAddDomain = async () => {
    const rawDomain = domainInput.trim().toLowerCase();
    if (!rawDomain) return showMessage('error', 'Please enter a domain');

    const domainRegex =
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
    if (!domainRegex.test(rawDomain))
      return showMessage('error', 'Invalid domain format');

    if (domains.some((d) => d.domain.toLowerCase() === rawDomain)) {
      return showMessage('error', 'Domain already exists');
    }

    setIsSaving(true);
    try {
      const response = await api.post('/admin/domains', { domain: rawDomain });
      const newDomain = response.data?.domain || response.data;
      setDomains([...domains, newDomain]);
      setDomainInput('');
      showMessage('success', `Added @${rawDomain}`);
    } catch (err: any) {
      showMessage('error', err.response?.data?.message || 'Failed to add');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (id: string) => {
    setConfirmDelete({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    const id = confirmDelete.id;
    if (!id) return;

    setIsSaving(true);
    try {
      await api.delete(`/admin/domains/${id}`);
      setDomains(domains.filter((d) => d.id !== id));
      showMessage('success', 'Domain removed');
      setConfirmDelete({ open: false, id: null });
    } catch (err: any) {
      showMessage('error', err.response?.data?.message || 'Failed to delete');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      {message && (
        <Alert
          severity={message.type}
          onClose={() => setMessage(null)}
          sx={{ mb: 3 }}
        >
          {message.text}
        </Alert>
      )}

      <Card sx={{ mb: 3, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Allowed Email Domains
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add email domains that are authorized to access the system.
          </Typography>

          <Box
            sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'flex-start' }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="example.com"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value.toLowerCase())}
              helperText="Only lowercase letters, numbers, hyphens allowed"
              disabled={isSaving}
              sx={{
                '& .MuiFormHelperText-root': { marginLeft: 0, marginTop: 1 },
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddDomain}
              disabled={isSaving || !domainInput.trim()}
              size="small"
              startIcon={!isSaving && <Add />}
              sx={{
                minWidth: 100,
                height: 40,
                whiteSpace: 'nowrap',
                mt: '1px',
              }}
            >
              {isSaving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                'ADD'
              )}
            </Button>
          </Box>

          <List
            sx={{
              bgcolor: 'grey.50',
              borderRadius: 1,
              border: '1px solid #f1f5f9',
            }}
          >
            {domains.map((d) => (
              <ListItem key={d.id}>
                <ListItemText
                  primary={
                    <Chip label={`@${d.domain}`} color="primary" size="small" />
                  }
                  secondary={`Added: ${new Date(d.addedAt).toLocaleDateString()}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={() => handleOpenDelete(d.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {domains.length === 0 && (
              <Typography
                sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}
              >
                No domains configured.
              </Typography>
            )}
          </List>

          <Alert severity="info" icon={<Info />} sx={{ mt: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Domain Policy
            </Typography>
            <Typography variant="body2">
              • You can add any valid domain (e.g. <strong>gmail.com</strong>)
              <br />
              • Users with emails matching these domains will be allowed to log
              in.
              <br />• Removing a domain will immediately revoke access for those
              users.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ ...confirmDelete, open: false })}
        onConfirm={handleConfirmDelete}
        title="Xóa tên miền?"
        content="Hành động này sẽ xóa tên miền khỏi hệ thống. Người dùng thuộc tên miền này sẽ mất quyền truy cập."
        variant="danger"
        confirmText="Xóa ngay"
        isLoading={isSaving}
      />
    </Box>
  );
}
