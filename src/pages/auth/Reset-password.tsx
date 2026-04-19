import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from 'components/ui/card';
import { Lock, ArrowLeft, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import authService from 'context/api/authservice';
import { toast } from 'sonner';

const ResetPassword: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        } else {
            toast.error(t('auth.invalid_reset_link', 'Invalid or missing reset token.'));
        }
    }, [searchParams, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error(t('auth.invalid_reset_link', 'Invalid or missing reset token.'));
            return;
        }

        if (password !== confirmPassword) {
            toast.error(t('auth.passwords_do_not_match', 'Passwords do not match.'));
            return;
        }

        if (password.length < 6) {
            toast.error(t('auth.password_too_short', 'Password must be at least 6 characters.'));
            return;
        }

        try {
            setIsLoading(true);
            await authService.resetPassword(token, password);
            setIsSuccess(true);
            toast.success(t('auth.password_reset_success', 'Your password has been reset successfully.'));
            // Optionally auto-redirect
            // setTimeout(() => navigate('/'), 3000);
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('auth.password_reset_error', 'An error occurred while resetting the password.'));
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
                <Card className="w-full max-w-md bg-slate-900 border-slate-800 shadow-xl text-center pb-6">
                    <CardHeader className="space-y-3 pb-6 border-b border-emerald-900/30">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <KeyRound className="w-8 h-8 text-emerald-500" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">
                            {t('auth.reset_success_title', 'All Set!')}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            {t('auth.reset_success_desc', 'Your password has been changed successfully. You can now login with your new credentials.')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => navigate('/')}
                        >
                            {t('auth.go_to_login', 'Go to Login')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800 shadow-xl">
                <CardHeader className="space-y-3 pb-6">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                            <Lock className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center text-white">
                        {t('auth.reset_password_title', 'Set New Password')}
                    </CardTitle>
                    <CardDescription className="text-center text-slate-400">
                        {t('auth.reset_password_desc', 'Please enter your new password below.')}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">
                                {t('auth.new_password', 'New Password')}
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-blue-500 pr-10"
                                    required
                                    disabled={isLoading || !token}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">
                                {t('auth.confirm_new_password', 'Confirm New Password')}
                            </label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-blue-500 pr-10"
                                    required
                                    disabled={isLoading || !token}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
                            disabled={isLoading || !token}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('auth.resetting', 'Resetting...')}
                                </>
                            ) : (
                                t('auth.reset_password_button', 'Reset Password')
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter>
                    <Button
                        variant="ghost"
                        className="w-full text-slate-400 hover:text-white hover:bg-slate-800"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('auth.back_to_login', 'Back to login')}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ResetPassword;