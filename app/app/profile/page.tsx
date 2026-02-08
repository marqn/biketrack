"use client";

import React, { useState, useEffect } from "react";
import {
  Camera,
  Mail,
  User,
  Lock,
  Check,
  X,
  Eye,
  EyeOff,
  Scale,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  weight: number | null;
  bio: string | null;
  profileSlug: string | null;
}

interface FormData {
  name: string;
  email: string;
  weight: string;
  bio: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface IsEditing {
  name: boolean;
  email: boolean;
  weight: boolean;
  bio: boolean;
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
  weight?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPassword, setHasPassword] = useState(false);

  const [isEditing, setIsEditing] = useState<IsEditing>({
    name: false,
    email: false,
    weight: false,
    bio: false,
    password: false,
  });

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    weight: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState<ShowPasswords>({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<Errors>({});
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Wczytaj dane użytkownika z API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();

        if (data.user) {
          setUser(data.user);
          setHasPassword(!!data.user.password);
          setFormData((prev) => ({
            ...prev,
            name: data.user.name || "",
            email: data.user.email || "",
            weight: data.user.weight?.toString() || "75",
            bio: data.user.bio || "",
          }));
        }
      } catch (error) {
        console.error("Błąd wczytywania profilu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        try {
          const response = await fetch("/api/user/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64Image }),
          });

          const data = await response.json();

          if (data.success && user) {
            setUser({ ...user, image: base64Image });
            setSuccessMessage("Avatar zaktualizowany!");
            setTimeout(() => setSuccessMessage(""), 3000);

            router.refresh();
          }
        } catch (error) {
          console.error("Błąd aktualizacji avatara:", error);
        }
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

  const handleSaveName = async () => {
    if (!formData.name.trim()) {
      setErrors({ name: "Nazwa użytkownika nie może być pusta" });
      return;
    }

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name }),
      });

      const data = await response.json();

      if (data.success && user) {
        setUser({ ...user, name: formData.name });
        setIsEditing({ ...isEditing, name: false });
        setErrors({});
        setSuccessMessage("Nazwa użytkownika zaktualizowana!");
        setTimeout(() => setSuccessMessage(""), 3000);

        router.refresh();
      }
    } catch (error) {
      console.error("Błąd aktualizacji nazwy:", error);
      setErrors({ name: "Wystąpił błąd podczas zapisywania" });
    }
  };

  const handleSaveEmail = async () => {
    if (!validateEmail(formData.email)) {
      setErrors({ email: "Podaj poprawny adres email" });
      return;
    }

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (data.success && user) {
        setUser({ ...user, email: formData.email });
        setIsEditing({ ...isEditing, email: false });
        setErrors({});
        setSuccessMessage("Email zaktualizowany!");
        setTimeout(() => setSuccessMessage(""), 3000);

        router.refresh();
      }
    } catch (error) {
      console.error("Błąd aktualizacji emaila:", error);
      setErrors({ email: "Wystąpił błąd podczas zapisywania" });
    }
  };

  const handleSaveWeight = async () => {
    const weightValue = parseInt(formData.weight);

    if (
      formData.weight &&
      (isNaN(weightValue) || weightValue < 20 || weightValue > 300)
    ) {
      setErrors({ weight: "Podaj wagę w zakresie 20-300 kg" });
      return;
    }

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: formData.weight ? weightValue : null }),
      });

      const data = await response.json();

      if (data.success && user) {
        setUser({ ...user, weight: formData.weight ? weightValue : null });
        setIsEditing({ ...isEditing, weight: false });
        setErrors({});
        setSuccessMessage("Waga zaktualizowana!");
        setTimeout(() => setSuccessMessage(""), 3000);

        router.refresh();
      }
    } catch (error) {
      console.error("Błąd aktualizacji wagi:", error);
      setErrors({ weight: "Wystąpił błąd podczas zapisywania" });
    }
  };

  const handleSavePassword = async () => {
    const newErrors: Errors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Podaj aktualne hasło";
    }

    if (!validatePassword(formData.newPassword)) {
      newErrors.newPassword = "Hasło musi mieć minimum 8 znaków";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Hasła nie są zgodne";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsEditing({ ...isEditing, password: false });
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setErrors({});
        setSuccessMessage("Hasło zaktualizowane!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrors({ currentPassword: data.error || "Nieprawidłowe hasło" });
      }
    } catch (error) {
      console.error("Błąd aktualizacji hasła:", error);
      setErrors({ currentPassword: "Wystąpił błąd podczas zapisywania" });
    }
  };

  const handleCancel = (field: keyof IsEditing) => {
    setIsEditing({ ...isEditing, [field]: false });
    setFormData({
      ...formData,
      name: user?.name || "",
      email: user?.email || "",
      weight: user?.weight?.toString() || "75",
      bio: user?.bio || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Ładowanie profilu...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Nie udało się wczytać profilu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Ustawienia Profilu</h1>
          <p className="text-muted-foreground mt-2">
            Zarządzaj swoimi danymi osobowymi
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4  dark:bg-green-950 border border-green-800 rounded-lg flex items-center gap-2">
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
                  <img
                    src={user.image}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
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
              <p className="text-sm text-muted-foreground mb-1">
                Kliknij ikonę aparatu, aby zmienić zdjęcie
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG lub GIF (max. 5MB)
              </p>
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
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                placeholder="Twoja nazwa"
              />
              {errors.name && (
                <p className="text-destructive text-sm mt-1">{errors.name}</p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSaveName}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Zapisz
                </button>
                <button
                  onClick={() => handleCancel("name")}
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
              <span>{user.name || "Nie ustawiono"}</span>
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
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                placeholder="twoj@email.com"
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email}</p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSaveEmail}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Zapisz
                </button>
                <button
                  onClick={() => handleCancel("email")}
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
              <span>{user.email || "Nie ustawiono"}</span>
            </div>
          )}
        </div>

        {/* Weight Section */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Waga</h2>
            {!isEditing.weight && (
              <button
                onClick={() => setIsEditing({ ...isEditing, weight: true })}
                className="text-primary hover:underline text-sm font-medium"
              >
                {user.weight ? "Edytuj" : "Dodaj"}
              </button>
            )}
          </div>

          {/* Info box */}
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Twoja waga jest istotna przy dodawaniu opinii o oponach i dętkach.
              Pozwala innym użytkownikom lepiej ocenić, przy jakim ciśnieniu i
              wadze dany produkt sprawdza się najlepiej.
            </p>
          </div>

          {isEditing.weight ? (
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  className="w-32 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                  placeholder="np. 75"
                  min="20"
                  max="300"
                />
                <span className="text-muted-foreground">kg</span>
              </div>
              {errors.weight && (
                <p className="text-destructive text-sm mt-1">{errors.weight}</p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSaveWeight}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Zapisz
                </button>
                <button
                  onClick={() => handleCancel("weight")}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Anuluj
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-muted-foreground" />
              <span>{user.weight ? `${user.weight} kg` : "Nie ustawiono"}</span>
            </div>
          )}
        </div>

        {/* Bio / Profil publiczny */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Profil publiczny</h2>
            {!isEditing.bio && (
              <button
                onClick={() => setIsEditing({ ...isEditing, bio: true })}
                className="text-primary hover:underline text-sm font-medium"
              >
                {user.bio ? "Edytuj" : "Dodaj"}
              </button>
            )}
          </div>
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Twój opis jest widoczny na Twoim publicznym profilu, gdy masz publiczne rowery.
            </p>
          </div>
          {isEditing.bio ? (
            <div>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                placeholder="Napisz kilka słów o sobie..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.bio.length}/500
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={async () => {
                    try {
                      // Generuj profileSlug jeśli nie ma
                      const slugData: Record<string, string | null> = {};
                      if (!user.profileSlug && user.name) {
                        const slug = user.name
                          .toLowerCase()
                          .replace(/[^a-z0-9\s-]/g, "")
                          .replace(/\s+/g, "-")
                          .replace(/-+/g, "-")
                          .trim();
                        slugData.profileSlug = `${slug}-${user.id.slice(-6)}`;
                      }

                      const response = await fetch("/api/user/profile", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          bio: formData.bio,
                          ...slugData,
                        }),
                      });
                      const data = await response.json();
                      if (data.success) {
                        setUser({
                          ...user,
                          bio: formData.bio || null,
                          profileSlug: slugData.profileSlug ?? user.profileSlug,
                        });
                        setIsEditing({ ...isEditing, bio: false });
                        setSuccessMessage("Profil publiczny zaktualizowany!");
                        setTimeout(() => setSuccessMessage(""), 3000);
                        router.refresh();
                      }
                    } catch (error) {
                      console.error("Błąd aktualizacji bio:", error);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Zapisz
                </button>
                <button
                  onClick={() => handleCancel("bio")}
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
              <span>{user.bio || "Nie ustawiono"}</span>
            </div>
          )}
          {user.profileSlug && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                Link do profilu:{" "}
                <a
                  href={`/app/discover/user/${user.profileSlug}`}
                  className="text-primary hover:underline"
                >
                  /app/discover/user/{user.profileSlug}
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Password Section - tylko dla użytkowników z hasłem */}
        {hasPassword && (
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
                      type={showPasswords.current ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent pr-10 bg-background"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          current: !showPasswords.current,
                        })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nowe hasło
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent pr-10 bg-background"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          new: !showPasswords.new,
                        })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Potwierdź nowe hasło
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent pr-10 bg-background"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          confirm: !showPasswords.confirm,
                        })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
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
                    onClick={() => handleCancel("password")}
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
        )}
      </div>
    </div>
  );
}
