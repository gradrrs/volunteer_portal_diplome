import { useState, useRef } from 'react';
import { apiClient } from '../api/axiosInstance';
import { X, Upload } from 'lucide-react';

interface AvatarUploadProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string | null;
  onAvatarUpdated: (newAvatarUrl: string) => void;
}

export default function AvatarUpload({ isOpen, onClose, currentAvatar, onAvatarUpdated }: AvatarUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatar);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const response = await apiClient.patch('/users/me/update/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onAvatarUpdated(response.data.avatar);
      onClose();
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
      alert('Не удалось загрузить аватар');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4">Загрузить аватар</h2>
        <div className="flex flex-col items-center gap-4">
          {preview && (
            <img src={preview} alt="Preview" className="w-32 h-32 rounded-full object-cover border" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-300"
          >
            <Upload className="w-4 h-4" /> Выбрать файл
          </button>
          {file && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Загрузка...' : 'Сохранить'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}