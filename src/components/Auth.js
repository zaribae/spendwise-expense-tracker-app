// src/components/Auth.js
import { confirmSignUp, signIn, signUp } from 'aws-amplify/auth';
import { useState } from 'react';
import Swal from 'sweetalert2';

function AuthCard({ title, children }) {
    return (
        <div className="bg-white shadow-lg rounded-xl p-8 border border-slate-200">
            <div className="mb-8 flex justify-center">
                <img
                    src="/images/logo.PNG"
                    alt="DompetHub Logo"
                    className="h-16 w-auto object-contain" // Atur tinggi (h-10) sesuai selera menggunakan Tailwind CSS
                />
            </div>
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">{title}</h2>
            {children}
        </div>
    );
}

function InputField({ label, type, value, onChange, required = false, placeholder = '' }) {
    return (
        <div className="mb-4">
            <label className="block text-gray-600 text-sm font-bold mb-2">{label}</label>
            <input
                className="shadow-inner appearance-none border border-slate-300 rounded w-full py-2 px-3 bg-slate-50 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
            />
        </div>
    );
}

export function SignUpForm({ setAuthScreen }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signUp({
                username: email,
                password,
                options: { userAttributes: { email, name } },
            });
            setStep(2);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleConfirmSignUp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await confirmSignUp({ username: email, confirmationCode: code });
            Swal.fire({ icon: 'success', title: 'Registration Successful!', text: 'You can now sign in.' });
            setAuthScreen('signIn');
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    if (step === 2) {
        return (
            <AuthCard title="Confirm Your Account">
                <p className="text-center text-sm text-gray-600 mb-4">A confirmation code has been sent to {email}.</p>
                <form onSubmit={handleConfirmSignUp}>
                    <InputField label="Confirmation Code" type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-white p-2 rounded-lg hover:bg-emerald-600 disabled:bg-gray-400 mt-4 transition-colors">
                        {loading ? 'Confirming...' : 'Confirm Account'}
                    </button>
                </form>
            </AuthCard>
        );
    }

    return (
        <AuthCard title="Create an Account">
            <form onSubmit={handleSignUp}>
                <InputField label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <InputField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="At least 8 characters" />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 mt-4 transition-colors">
                    {loading ? 'Creating...' : 'Create Account'}
                </button>
                <p className="text-center text-sm text-gray-600 mt-4">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setAuthScreen('signIn')} className="text-blue-500 hover:underline">Sign In</button>
                </p>
            </form>
        </AuthCard>
    );
}

export function SignInForm({ setAuthScreen, onSignIn }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signIn({ username: email, password });
            Swal.fire({ icon: 'success', title: 'Signed In!', timer: 1500, showConfirmButton: false });
            onSignIn();
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <AuthCard title="Sign In">
            <form onSubmit={handleSignIn}>
                <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <InputField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 mt-4 transition-colors">
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
                <p className="text-center text-sm text-gray-600 mt-4">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => setAuthScreen('signUp')} className="text-blue-500 hover:underline">Sign Up</button>
                </p>
            </form>
        </AuthCard>
    );
}
