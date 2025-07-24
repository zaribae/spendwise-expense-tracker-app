// src/components/AddTransactionForm.js
import { post } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import React, { useState } from 'react';

export default function AddTransactionForm({ onTransactionAdded }) {
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) {
            setError('Please enter a transaction.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
            if (!authToken) {
                throw new Error("User ID token not found.");
            }

            const requestOptions = {
                headers: {
                    Authorization: authToken
                },
                body: {
                    text: text
                }
            };

            const operation = post({
                apiName: 'ExpenseTrackerAPI',
                path: '/process-text',
                options: requestOptions
            });

            const { body } = await operation.response;
            const result = await body.json();

            if (result.error) {
                setError(result.error);
            } else {
                setText('');
                onTransactionAdded();
            }
        } catch (err) {
            console.error('Error processing transaction:', err);
            setError('Could not understand the transaction. Please try rephrasing.');
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Transaction (AI-Powered)</h2>
            {/* FIX: Updated example text to use IDR and Bahasa Indonesia */}
            <p className="text-gray-600 mb-4">Simply type your transaction below. E.g., "monthly salary 5jt" or "beli kopi 15k".</p>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type your transaction here..."
                        className="flex-grow w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
                    >
                        {loading ? 'Processing...' : 'Add'}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </form>
        </div>
    );
}
