import { useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "../hooks/use-toast";

interface RegistrationFormProps {
  onSuccess: (code: string, name: string) => void;
}

const RegistrationForm = ({ onSuccess }: RegistrationFormProps) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateCode = () => {
    return Math.floor(100000000 + Math.random() * 1000000000).toString();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      toast({ title: "טעות", description: "בבקשה הזן שם", variant: "destructive" });
      return;
    }

    if (trimmedName.length < 5) {
      toast({ title: "שגיאה", description: "השם צריך להכיל לפחות 5 אותיות", variant: "destructive" });
      return;
    }

    if (trimmedName.length > 20) {
      toast({ title: "שגיאה", description: "השם ארוך מדי (מקסימום 20 אותיות)", variant: "destructive" });
      return;
    }

    setLoading(true);
    let code = generateCode();
    let attempts = 0;
    const maxAttempts = 5;

    try {
      
      while (attempts < maxAttempts) {
        const { data: existing } = await supabase
          .from("users")
          .select("code")
          .eq("code", code)
          .maybeSingle();
        
        if (!existing) break;
        
        code = generateCode();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error("לא ניתן ליצור קוד ייחודי. נסה שוב.");
      }

      const { error, data } = await supabase
        .from("users")
        .insert({ code, name: trimmedName, role: "user" })
        .select()
        .single();

      if (error) {
        console.error("Registration insert error:", error);
        if (error.code === "23505") {
          throw new Error("קוד כבר קיים במערכת. נסה שוב.");
        }
        throw new Error("שגיאה ביצירת חשבון. נסה שוב.");
      }

      if (!data) {
        throw new Error("לא ניתן ליצור חשבון. נסה שוב.");
      }

      onSuccess(data.code, data.name);
      toast({
        title: "תודה על ההרשמה!",
        description: ` זה הקוד שלך : ${data.code}. שמור אותו!`,
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "שגיאת רישום",
        description: error.message || "אירעה שגיאה בעת הרישום",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
          הרשמה
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          צור חשבון חדש במערכת
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">שם מלא</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="הזן שם מלא (שם ושם מישפחה)"
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "רושם..." : "הירשם"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        לאחר הרישום, תקבל קוד בן 10 ספרות לכניסה למערכת
      </p>
    </form>
  );
};

export default RegistrationForm;
