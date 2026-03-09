import { useState } from "react";
interface RegistrationFormProps {
  onSuccess: (code: string, name: string) => void;
}
const RegistrationForm = ({ onSuccess }: RegistrationFormProps) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const generateCode = () => {
    return Math.floor(100000000 + Math.random() * 1000000000).toString();
  };
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 5 || trimmedName.length > 20) {
      alert("שם לא תקין (5-20 תווים)");
      return;
    }
    setLoading(true);
    try {
      const code = generateCode();
      const newUser = {
        code,
        name: trimmedName,
        role: "user",
        createdAt: new Date().toISOString()
      };
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
      existingUsers.push(newUser);
      localStorage.setItem("users", JSON.stringify(existingUsers));
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      alert(`נרשמת בהצלחה! הקוד שלך: ${code}`);
      onSuccess(code, trimmedName);
    } catch (error) {
      alert("שגיאה בשמירת הנתונים");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md border" dir="rtl">
      <form onSubmit={handleRegister} className="space-y-4 flex flex-col text-right">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-600">הרשמה מקומית</h2>
          <p className="text-sm text-gray-500">הנתונים יישמרו בדפדפן בלבד</p>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">שם מלא</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="הזן שם מלא"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? "שומר..." : "הירשם"}
        </button>
        <p className="text-xs text-gray-400 text-center">
          הקוד ישמש אותך לכניסה חוזרת ממחשב זה
        </p>
      </form>
    </div>
  );
};

export default RegistrationForm;
