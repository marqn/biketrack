'use client';

import React, { useState } from 'react';
import { Camera, Mail, User, Lock, Check, X, Eye, EyeOff } from 'lucide-react';

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface FormData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface IsEditing {
  name: boolean;
  email: boolean;
  password: boolean;
}

interface ShowPasswords {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

interface Errors {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData>({
    id: 'user123',
    name: 'Jan Kowalski',
    email: 'jan.kowalski@example.com',
    image: null
  });

  const [isEditing, setIsEditing] = useState<IsEditing>({
    name: false,
    email: false,
    password: false
  });

  const [formData, setFormData] = useState<FormData>({
    name: user.name || '',
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState<ShowPasswords>({
    current: false,
    new: false,
    confirm: false
  });

  const [errors, setErrors] = useState<Errors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, image: reader.result as string });
        setSuccessMessage('Avatar zaktualizowany!');
        setTimeout(() => setSuccessMessage(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleSaveName = () => {
    if (!formData.name.trim()) {
      setErrors({ name: 'Nazwa użytkownika nie może być pusta' });
      return;
    }
    setUser({ ...user, name: formData.name });
    setIsEditing({ ...isEditing, name: false });
    setErrors({});
    setSuccessMessage('Nazwa użytkownika zaktualizowana!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSaveEmail = () => {
    if (!validateEmail(formData.email)) {
      setErrors({ email: 'Podaj poprawny adres email' });
      return;
    }
    setUser({ ...user, email: formData.email });
    setIsEditing({ ...isEditing, email: false });
    setErrors({});
    setSuccessMessage('Email zaktualizowany!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSavePassword = () => {
    const newErrors: Errors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Podaj aktualne hasło';
    }

    if (!validatePassword(formData.newPassword)) {
      newErrors.newPassword = 'Hasło musi mieć minimum 8 znaków';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Hasła nie są zgodne';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsEditing({ ...isEditing, password: false });
    setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    setSuccessMessage('Hasło zaktualizowane!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCancel = (field: keyof IsEditing) => {
    setIsEditing({ ...isEditing, [field]: false });
    setFormData({
      ...formData,
      name: user.name || '',
      email: user.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Ustawienia Profilu</h1>
          <p className="text-muted-foreground mt-2">Zarządzaj swoimi danymi osobowymi</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        {/* Avatar Section */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Zdjęcie profilowe</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden">
                {user.image ? (
                  <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Kliknij ikonę aparatu, aby zmienić zdjęcie</p>
              <p className="text-xs text-muted-foreground">JPG, PNG lub GIF (max. 5MB)</p>
            </div>
          </div>
        </div>

        {/* Name Section */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Nazwa użytkownika</h2>
            {!isEditing.name && (
              <button
                onClick={() => setIsEditing({ ...isEditing, name: true })}
                className="text-primary hover:underline text-sm font-medium"
              >
                Edytuj
              </button>
            )}
          </div>
          {isEditing.name ? (
            <div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                placeholder="Twoja nazwa"
              />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSaveName}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Zapisz
                </button>
                <button
                  onClick={() => handleCancel('name')}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Anuluj
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <span>{user.name || 'Nie ustawiono'}</span>
            </div>
          )}
        </div>

        {/* Email Section */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Adres email</h2>
            {!isEditing.email && (
              <button
                onClick={() => setIsEditing({ ...isEditing, email: true })}
                className="text-primary hover:underline text-sm font-medium"
              >
                Edytuj
              </button>
            )}
          </div>
          {isEditing.email ? (
            <div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                placeholder="twoj@email.com"
              />
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSaveEmail}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Zapisz
                </button>
                <button
                  onClick={() => handleCancel('email')}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Anuluj
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <span>{user.email || 'Nie ustawiono'}</span>
            </div>
          )}
        </div>

        {/* Password Section */}
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Hasło</h2>
            {!isEditing.password && (
              <button
                onClick={() => setIsEditing({ ...isEditing, password: true })}
                className="text-primary hover:underline text-sm font-medium"
              >
                Zmień hasło
              </button>
            )}
          </div>
          {isEditing.password ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Aktualne hasło
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent pr-10 bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.currentPassword && <p className="text-destructive text-sm mt-1">{errors.currentPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Nowe hasło
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent pr-10 bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-destructive text-sm mt-1">{errors.newPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Potwierdź nowe hasło
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent pr-10 bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSavePassword}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Zapisz hasło
                </button>
                <button
                  onClick={() => handleCancel('password')}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Anuluj
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <span>••••••••</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}