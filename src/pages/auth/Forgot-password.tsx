import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from 'components/ui/card';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import authService from 'context/api/authservice';
import { toast } from 'sonner';

const ForgotPassword: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error(t('auth.email_required', 'Email is required'));
            return;
        }

        try {
            setIsLoading(true);
            await authService.forgotPassword(email);
            setIsSubmitted(true);
            toast.success(t('auth.reset_link_sent', 'Check your email for a reset link.'));
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('auth.reset_link_error', 'An error occurred.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800 shadow-xl">
                <CardHeader className="space-y-3 pb-6">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                            <Mail className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center text-white">
                        {t('auth.forgot_password_title', 'Forgot Password?')}
                    </CardTitle>
                    <CardDescription className="text-center text-slate-400">
                        {isSubmitted
                            ? t('auth.forgot_password_success_desc', 'We have sent password reset instructions to your email address.')
                            : t('auth.forgot_password_desc', 'Enter your email address and we will send you a link to reset your password.')}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">
                                    {t('auth.email_label', 'Email Address')}
                                </label>
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t('auth.sending', 'Sending...')}
                                    </>
                                ) : (
                                    t('auth.send_reset_link', 'Send Reset Link')
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4">
                            <Button
                                variant="outline"
                                className="w-full border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-800"
                                onClick={() => setIsSubmitted(false)}
                            >
                                {t('auth.try_another_email', 'Try another email')}
                            </Button>
                        </div>
                    )}
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

export default ForgotPassword;