import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from '../../components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { Separator } from "../../components/ui/separator"
import { Button } from '../../components/ui/button';
import { Label } from "../../components/ui/label";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const Login: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login, isLoading } = useAuth();
    const { logoUrl } = useSettings();

    const onLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            toast.error('Chan yo vid', {
                description: 'Tanpri ranpli email ak password ou.',
            });
            return;
        }

        try {
            await login({ email, password });
            // Redirect based on role
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                // In our system, user.role is an object with a 'name' property
                if (user.role?.name === 'ADMIN' || user.role?.name === 'SUPER_ADMIN') {
                    navigate('/dashboard');
                } else {
                    navigate('/pos');
                }
            }
        } catch (err) {
            // Error already handled in AuthContext
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-sm bg-white border-slate-200 shadow-xl overflow-hidden">
                <div className="h-2 bg-primary w-full" />
                <CardHeader>
                    <div className="flex items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold text-slate-900">Konekte</CardTitle>
                            <CardDescription className="text-slate-500">Konekte nan kont ou</CardDescription>
                        </div>
                        <div className="flex items-center">
                            <span className="bg-slate-50 p-2 rounded-full border border-slate-100 shadow-sm">
                                <img
                                    src={logoUrl || '/logo.jpeg'}
                                    alt="Logo"
                                    className="w-6 h-6"
                                // onError={(e) => {
                                //     const target = e.target as HTMLImageElement;
                                //     target.src = '/logo.png'; // Fallback if logo.jpeg fails
                                // }}
                                />
                            </span>
                        </div>
                    </div>
                    <Separator className="bg-slate-100" />
                </CardHeader>
                <CardContent>
                    <form onSubmit={onLoginSubmit}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-primary"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700 font-medium">Modpas</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-primary pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    variant="link"
                                    className="text-primary hover:text-primary/80 px-0 h-auto text-sm font-medium"
                                    onClick={() => navigate('/forgot-password')}
                                    type="button"
                                >
                                    Modpas bliye?
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11" disabled={isLoading} onClick={onLoginSubmit}>
                        {isLoading ? 'Konkeksyon ap fèt...' : 'Konekte'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};
export default Login;
