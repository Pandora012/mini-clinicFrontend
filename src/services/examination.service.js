import api from "./api";

export const examinationService = {
  getAll: () => api.get("/queue/today"),
  getByRegistrationId: (registrationId) => api.get(`/examinations/registration/${registrationId}`),
  getPatientHistory: (patientId) => api.get(`/examinations/patient/${patientId}/history`),
  create: (data) => api.post("/examinations", data),
  update: (id, data) => api.put(`/examinations/${id}`, data),
  addMedicalAction: (data) => api.post("/examinations/medical-actions", data),
  addPrescription: (data) => api.post("/examinations/prescriptions", data),
  complete: (id) => api.put(`/examinations/${id}/complete`),
};
