import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Server, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import { authService } from "../../../services/authService";
import { alertService } from "../../../lib/alerts";

export function Register() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });
    const [formErrors, setFormErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });
    const [formTouched, setFormTouched] = useState({
        firstName: false,
        lastName: false,
        email: false,
        password: false,
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validateField = (field: string, value: string) => {
        switch (field) {
            case "firstName":
                if (!value.trim()) return "First name is required.";
                return "";
            case "lastName":
                if (!value.trim()) return "Last name is required.";
                return "";
            case "email":
                if (!value.trim()) return "Email is required.";
                if (!emailRegex.test(value)) return "Please enter a valid email address.";
                return "";
            case "password":
                if (!value) return "Password is required.";
                return "";
            default:
                return "";
        }
    };

    const validateForm = () => {
        const errors = {
            firstName: validateField("firstName", formData.firstName),
            lastName: validateField("lastName", formData.lastName),
            email: validateField("email", formData.email),
            password: validateField("password", formData.password),
        };

        setFormErrors(errors);
        return !Object.values(errors).some(Boolean);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                const response = await authService.register(formData);

                alertService.success(response.message || "Registration successful!");

                navigate("/login");


            } catch (error: any) {
                console.error("Registration error:", error);

                alertService.error(error.message || "Something went wrong. Please try again.");
            }
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFormTouched((prev) => ({ ...prev, [field]: true }));
        setFormErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    };

    const passwordStrength = formData.password.length >= 8;
    const isFormValid =
        formData.firstName.trim().length > 0 &&
        formData.lastName.trim().length > 0 &&
        emailRegex.test(formData.email) &&
        formData.password.length >= 8;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-lg p-2">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-blue-600">
                        <Server className="size-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Create an account</CardTitle>
                    <CardDescription>Get started with HelpDesk Pro today</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First name</Label>
                                <Input
                                    id="firstName"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={(e) => handleChange("firstName", e.target.value)}
                                    aria-invalid={!!formErrors.firstName}
                                    className={formErrors.firstName ? "border-destructive focus-visible:ring-destructive/50" : ""}
                                    required
                                />
                                {formTouched.firstName && formErrors.firstName && (
                                    <p className="text-sm text-red-600">{formErrors.firstName}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last name</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={(e) => handleChange("lastName", e.target.value)}
                                    aria-invalid={!!formErrors.lastName}
                                    className={formErrors.lastName ? "border-destructive focus-visible:ring-destructive/50" : ""}
                                    required
                                />
                                {formTouched.lastName && formErrors.lastName && (
                                    <p className="text-sm text-red-600">{formErrors.lastName}</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                aria-invalid={!!formErrors.email}
                                className={formErrors.email ? "border-destructive focus-visible:ring-destructive/50" : ""}
                                required
                            />
                            {formTouched.email && formErrors.email && (
                                <p className="text-sm text-red-600">{formErrors.email}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                    aria-invalid={!!formErrors.password}
                                    className={formErrors.password ? "border-destructive focus-visible:ring-destructive/50" : ""}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="flex items-center gap-2 text-sm">
                                    {passwordStrength ? (
                                        <>
                                            <CheckCircle2 className="size-4 text-green-600" />
                                            <span className="text-green-600">Strong password</span>
                                        </>
                                    ) : (
                                        <span className="text-muted-foreground">Password must be at least 8 characters</span>
                                    )}
                                </div>
                            )}
                            {formTouched.password && formErrors.password && (
                                <p className="text-sm text-red-600">{formErrors.password}</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={!isFormValid}>
                            Create account
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}