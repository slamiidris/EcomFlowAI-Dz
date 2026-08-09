import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import AuthLayout from './AuthLayout';
import OtpInput from '../components/OtpInput';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { authApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { cn } from '../lib/utils';

type Step = 0 | 1 | 2;

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(0);
  const [email, setEmail] = useState(() => sessionStorage.getItem('dz_reset_email') || '');
  const [digits, setDigits] = useState<string[]>(Array.from({ length: 6 }, () => ''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [dev, setDev] = useState(false);
  const [resetToken, setResetToken] = useState(() => sessionStorage.getItem('dz_reset_token') || '');

  const didAutoSubmit = useRef(false);

  // If we have a stored reset token and email, skip to step 2
  useEffect(() => {
    if (resetToken && email) setStep(2);
  }, []);

  // Resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  // Auto-submit OTP
  const code = digits.join('');
  useEffect(() => {
    if (step === 1 && code.length === 6 && !submitting && !didAutoSubmit.current) {
      didAutoSubmit.current = true;
      handleVerifyCode(code);
    }
  }, [code]);

  const handleRequestCode = async () => {
    const em = email.trim();
    if (!em) {
      setError(t('fpErrEmail', 'Entre ton adresse email.'));
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await authApi.forgotPassword(em);
      sessionStorage.setItem('dz_reset_email', em);
      setDev(Boolean(res.dev));
      setCooldown(60);
      setStep(1);
      setDigits(Array.from({ length: 6 }, () => ''));
      didAutoSubmit.current = false;
    } catch (err: any) {
      setError(err.message || t('fpErrGeneric', 'Une erreur est survenue.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCode = async (codeToSend: string = code) => {
    if (codeToSend.length !== 6) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await authApi.verifyResetOtp(email, codeToSend);
      sessionStorage.setItem('dz_reset_token', res.resetToken);
      setResetToken(res.resetToken);
      setStep(2);
    } catch (err: any) {
      setError(err.message || t('fpErrCodeInvalid', 'Code invalide ou expiré.'));
      setDigits(Array.from({ length: 6 }, () => ''));
      didAutoSubmit.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setCooldown(60);
    try {
      await authApi.resendOtp(email, 'password_reset');
    } catch (err: any) {
      setError(err.message || t('fpErrGeneric', 'Une erreur est survenue.'));
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      setError(t('fpErrPwShort', 'Le mot de passe doit contenir au moins 8 caractères.'));
      return;
    }
    if (newPassword !== confirmPw) {
      setError(t('fpErrPwMismatch', 'Les mots de passe ne correspondent pas.'));
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await authApi.resetPassword(email, resetToken, newPassword);
      sessionStorage.removeItem('dz_reset_email');
      sessionStorage.removeItem('dz_reset_token');
      navigate('/login?reset=1', { replace: true });
    } catch (err: any) {
      setError(err.message || t('fpErrTokenExpired', 'Le lien a expiré. Recommence depuis le début.'));
      if (err.message?.includes('expir')) {
        setStep(0);
        setResetToken('');
        sessionStorage.removeItem('dz_reset_token');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeEmail = () => {
    sessionStorage.removeItem('dz_reset_email');
    sessionStorage.removeItem('dz_reset_token');
    setEmail('');
    setResetToken('');
    setStep(0);
  };

  const stepLabels = [t('fpStepEmail', 'Email'), t('fpStepCode', 'Code'), t('fpStepPassword', 'Mot de passe')];

  return (
    <AuthLayout
      title={t('fpTitle', 'Réinitialiser le mot de passe')}
      subtitle={
        step === 0
          ? t('fpEmailSubtitle', "Entre ton email, on t'envoie un code à 6 chiffres.")
          : step === 1
            ? undefined
            : t('fpNewPwSubtitle', '8 caractères minimum.')
      }
      showBack
      footer={
        step === 0 ? (
          <p>
            <Link to="/login" className="font-bold text-dz-emerald hover:text-dz-gold transition-colors">
              {t('fpBackToLogin', 'Retour à la connexion')}
            </Link>
          </p>
        ) : undefined
      }
    >
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {stepLabels.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-all',
                i < step
                  ? 'bg-dz-emerald text-black'
                  : i === step
                    ? 'bg-dz-emerald/20 text-dz-emerald border border-dz-emerald/40'
                    : 'bg-white/5 text-white/25 border border-white/10'
              )}
            >
              {i < step ? '✓' : i + 1}
            </div>
            {i < stepLabels.length - 1 && (
              <div className={cn('w-6 h-px', i < step ? 'bg-dz-emerald/40' : 'bg-white/10')} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Email */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-white/40 mb-1.5">
              {t('authEmail', 'Adresse email')}
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@email.com"
                className="input-dz pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleRequestCode()}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[12.5px] text-rose-300">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={submitting}
            onClick={handleRequestCode}
            className="btn-dz-primary w-full disabled:opacity-60 disabled:pointer-events-none"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            {submitting ? t('fpSending', 'Envoi du code…') : t('fpContinue', 'Continuer')}
          </button>
        </div>
      )}

      {/* Step 1: OTP */}
      {step === 1 && (
        <div className="space-y-5">
          <p className="text-sm text-white/45 text-center">
            {t('fpCodeSentTo', 'Code envoyé à')}{' '}
            <span className="font-bold text-dz-emerald font-mono">{email}</span>
          </p>

          <OtpInput value={digits} onChange={setDigits} error={!!error} />

          {dev && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-[11.5px] text-amber-300 font-mono">
              {t('authDevHint', 'Mode dév : le code est affiché dans la console du serveur.')}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[12.5px] text-rose-300">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={submitting || code.length !== 6}
            onClick={() => handleVerifyCode()}
            className="btn-dz-primary w-full disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            {submitting ? t('authVerifying', 'Vérification…') : t('fpVerifyBtn', 'Vérifier le code')}
          </button>

          <div className="flex items-center justify-center gap-2 text-[12px] text-white/45">
            <span>{t('authNoCode', "Tu n'as rien reçu ?")}</span>
            {cooldown > 0 ? (
              <span className="font-mono text-white/30">
                {t('authResendIn', 'Renvoyer dans')} {cooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="font-bold text-dz-emerald hover:text-white transition-colors cursor-pointer"
              >
                {t('authResend', 'Renvoyer le code')}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleChangeEmail}
            className="w-full text-center text-[11px] text-white/30 hover:text-white/50 transition-colors cursor-pointer"
          >
            {t('fpChangeEmail', "Ce n'est pas mon email — changer")}
          </button>
        </div>
      )}

      {/* Step 2: New Password */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-white/40 mb-1.5">
              {t('fpNewPassword', 'Nouveau mot de passe')}
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="input-dz pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {newPassword && <PasswordStrengthMeter password={newPassword} className="mt-2" />}
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-white/40 mb-1.5">
              {t('authConfirmPassword', 'Confirmer le mot de passe')}
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="••••••••"
                className="input-dz pl-10"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[12.5px] text-rose-300">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={submitting}
            onClick={handleResetPassword}
            className="btn-dz-primary w-full disabled:opacity-60 disabled:pointer-events-none"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
            {submitting
              ? t('fpResetting', 'Réinitialisation…')
              : t('fpResetBtn', 'Réinitialiser le mot de passe')}
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
