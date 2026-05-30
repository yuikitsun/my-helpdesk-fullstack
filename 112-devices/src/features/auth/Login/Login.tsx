import { Server, Eye, EyeOff } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from "react-router";
import { authService } from "../../../services/authService";
import { alertService } from "../../../lib/alerts";

export function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await authService.login({ email, password });

            if (response.token) {
                localStorage.setItem("token", response.token);
                localStorage.setItem("userFullName", response.user.fullName);
            }

            alertService.success("Welcome back!", "Login successful.");

            navigate("/dashboard");


        } catch (error: any) {
            console.error("Login error:", error);
            alertService.error(error.message || "Invalid email or password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="space-y-1 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-blue-600">
                    <Server className="size-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                <CardDescription>
                    Sign in to your HelpDesk Pro account
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                disabled={isLoading}
                            >
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                </form>
                <div className="mt-6 text-center text-sm">
                    <span className="text-muted-foreground">Don't have an account? </span>
                    <Link to="/register" className="text-blue-600 hover:underline">
                        Sign up
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

export default Login;