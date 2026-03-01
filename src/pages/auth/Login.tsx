import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from '../../components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { Separator } from "../../components/ui/separator"
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login, isLoading } = useAuth();

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
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-white p-4">
            <Card className="w-full max-w-sm bg-white/20 backdrop-blur-lg border-white/30 border-dashed border-2 shadow-xl">
                <CardHeader>
                    <div className="flex items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold text-white">Konekte</CardTitle>
                            <CardDescription className="text-gray-300">Konekte nan kont ou</CardDescription>
                        </div>
                        <div className="flex items-center">
                            {/* Google Button Placeholder */}
                            <span className="text-white bg-white/10 p-2 rounded-full cursor-pointer hover:bg-white/20 transition-colors">
                                <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="" className="w-6 h-6" />
                            </span>
                        </div>
                    </div>
                    <Separator className="bg-white/20" />
                </CardHeader>
                <CardContent>
                    <form onSubmit={onLoginSubmit}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full max-w-sm bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:bg-white/20"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full max-w-sm bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:bg-white/20 pr-16"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center height-full">
                                    <Separator orientation="vertical" className="h-6 bg-white/20 mr-2" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-gray-300 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    variant="link"
                                    className="text-white/70 hover:text-white px-0 h-auto text-sm"
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
                    <Button type="submit" className="w-full" disabled={isLoading} onClick={onLoginSubmit}>
                        {isLoading ? 'Konkeksyon ap fèt...' : 'Konekte'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};
export default Login;
