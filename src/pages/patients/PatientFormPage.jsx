import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { patientService } from '../../services/patient.service';
import { toast } from 'react-toastify';
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import { GENDER } from '../../constants';

const PatientFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);

  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  useEffect(() => {
    let active = true;
    if (!id) { reset({ nik: '', name: '', gender: '', birth_date: '', phone: '', address: '' }); setInitialLoading(false); return; }
    setInitialLoading(true); setLoadError('');
    patientService.getById(id).then(response => { if (active) reset(response.data.data); })
      .catch(error => { if (active) setLoadError(error.response?.data?.message || 'Data pasien gagal dimuat.'); })
      .finally(() => { if (active) setInitialLoading(false); });
    return () => { active = false; };
  }, [id, reset]);
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      if (isEdit) {
        await patientService.update(id, data);
        toast.success('Data pasien berhasil diperbarui.');
      } else {
        await patientService.create(data);
        toast.success('Data pasien berhasil ditambahkan.');
      }
      navigate('/patients');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Data pasien gagal disimpan.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <LoadingSpinner />;
  if (loadError) return <ErrorState message={loadError} />;
  return (
    <div>
      <h2 className="mb-4">{isEdit ? 'Edit Pasien' : 'Tambah Pasien Baru'}</h2>

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="patient-nik" className="mb-3">
                  <Form.Label>NIK <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="16 digit NIK"
                    isInvalid={!!errors.nik}
                    {...register('nik', {
                      required: 'NIK is required',
                      pattern: {
                        value: /^\d{16}$/,
                        message: 'NIK must be 16 digits'
                      }
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nik?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="patient-name" className="mb-3">
                  <Form.Label>Nama Lengkap <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nama lengkap pasien"
                    isInvalid={!!errors.name}
                    {...register('name', { required: 'Name is required' })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="patient-gender" className="mb-3">
                  <Form.Label>Jenis Kelamin <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    isInvalid={!!errors.gender}
                    {...register('gender', { required: 'Gender is required' })}
                  >
                    <option value="">Pilih jenis kelamin</option>
                    <option value={GENDER.LAKI_LAKI}>{GENDER.LAKI_LAKI}</option>
                    <option value={GENDER.PEREMPUAN}>{GENDER.PEREMPUAN}</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.gender?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="patient-birth-date" className="mb-3">
                  <Form.Label>Tanggal Lahir <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    isInvalid={!!errors.birth_date}
                    {...register('birth_date', { required: 'Birth date is required' })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.birth_date?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="patient-phone" className="mb-3">
                  <Form.Label>Nomor Telepon <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    isInvalid={!!errors.phone}
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9+\-\s()]{10,20}$/,
                        message: 'Invalid phone number format'
                      }
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="patient-address" className="mb-4">
              <Form.Label>Alamat <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Alamat lengkap pasien"
                isInvalid={!!errors.address}
                {...register('address', { required: 'Address is required' })}
              />
              <Form.Control.Feedback type="invalid">
                {errors.address?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Menyimpan...
                  </>
                ) : (
                  isEdit ? 'Perbarui' : 'Simpan'
                )}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/patients')}>
                Batal
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PatientFormPage;
