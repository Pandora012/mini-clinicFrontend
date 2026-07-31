import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { patientService } from '../../services/patient.service';
import { toast } from 'react-toastify';
import { GENDER } from '../../constants';

const PatientFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: async () => {
      if (isEdit) {
        const response = await patientService.getById(id);
        const patient = response.data;
        return {
          nik: patient.nik,
          name: patient.name,
          gender: patient.gender,
          birth_date: patient.birth_date,
          phone: patient.phone,
          address: patient.address
        };
      }
      return {};
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      if (isEdit) {
        await patientService.update(id, data);
        toast.success('Patient updated successfully');
      } else {
        await patientService.create(data);
        toast.success('Patient created successfully');
      }
      navigate('/patients');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4">{isEdit ? 'Edit Pasien' : 'Tambah Pasien Baru'}</h2>

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
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
                <Form.Group className="mb-3">
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
                <Form.Group className="mb-3">
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
                <Form.Group className="mb-3">
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
                <Form.Group className="mb-3">
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

            <Form.Group className="mb-4">
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
                  isEdit ? 'Update' : 'Simpan'
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