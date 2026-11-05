import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useAuth } from '../../contexts/useAuth';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await login(data);
      toast.success(response.message);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal masuk. Periksa username dan kata sandi Anda.');
    } finally { setLoading(false); }
  };
  return (
    <div className="login-page">
      <section className="login-story">
        <div className="login-brand"><span className="brand-mark"><i className="bi bi-heart-pulse" /></span>Mini Clinic</div>
        <div>
          <h1>Pelayanan yang baik dimulai dari sini.</h1>
          <p>Dari pendaftaran hingga pemeriksaan, kelola pelayanan pasien dengan lebih teratur dan nyaman.</p>
          <div className="care-illustration"><i className="bi bi-hospital" aria-hidden="true" /><div><strong>Satu ruang untuk seluruh pelayanan</strong><span>Pasien, antrean, dan pemeriksaan saling terhubung.</span></div></div>
        </div>
        <footer>Mini Clinic · Sistem informasi pelayanan klinik</footer>
      </section>
      <section className="login-form-panel" aria-labelledby="login-title">
        <div className="login-form-wrap">
          <h2 id="login-title">Selamat datang kembali</h2>
          <p>Masuk ke akun Anda untuk memulai pelayanan.</p>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-4" controlId="login-username">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" placeholder="Masukkan username Anda" autoComplete="username" isInvalid={!!errors.username} {...register('username', { required: 'Username wajib diisi' })} />
              <Form.Control.Feedback type="invalid">{errors.username?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-4" controlId="login-password">
              <Form.Label>Kata sandi</Form.Label>
              <div className="input-group">
                <Form.Control type={showPassword ? 'text' : 'password'} placeholder="Masukkan kata sandi" autoComplete="current-password" isInvalid={!!errors.password} {...register('password', { required: 'Kata sandi wajib diisi' })} />
                <Button variant="outline-secondary" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} aria-pressed={showPassword}><i className={`bi bi-eye${showPassword ? '-slash' : ''}`} /></Button>
                <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
              </div>
            </Form.Group>
            <Button type="submit" className="w-100" disabled={loading}>{loading ? <><span className="spinner-border spinner-border-sm me-2" />Sedang masuk...</> : 'Masuk ke ruang kerja'}</Button>
          </Form>
          <p className="login-security"><i className="bi bi-shield-check me-2" />Gunakan akun yang diberikan administrator klinik.</p>
        </div>
      </section>
    </div>
  );
};
export default LoginPage;
