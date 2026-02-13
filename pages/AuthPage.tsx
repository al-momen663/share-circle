import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	auth,
	db
} from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserRole } from '../types';

const AuthPage: React.FC = () => {
	const navigate = useNavigate();
	const [isLogin, setIsLogin] = useState(true);
	const [role, setRole] = useState<UserRole>(UserRole.DONOR);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showOptions, setShowOptions] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleAuthSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			if (isLogin) {
				// Fix: Use modular signInWithEmailAndPassword with auth instance
				await signInWithEmailAndPassword(auth, email, password);
				// On successful login, show view options
				setShowOptions(true);
			} else {
				// Fix: Use modular createUserWithEmailAndPassword with auth instance
				const userCredential = await createUserWithEmailAndPassword(auth, email, password);
				const fbUser = userCredential.user;

				// Save user details to Firestore
				await setDoc(doc(db, 'users', fbUser.uid), {
					name,
					email,
					role,
					avatar: `https://ui-avatars.com/api/?name=${name || 'K'}&background=10b981&color=fff&bold=true`
				});

				setShowOptions(true);
			}
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};
	const handleFinalLogin = (viewType: 'grid' | 'map') => {
    localStorage.setItem('share_circle_initial_view', viewType);
    navigate('/dashboard');
  };