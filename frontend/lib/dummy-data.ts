export type Patient = {
  id: string
  name: string
  email: string
  phone: string
  age: number
  gender: string
  bloodGroup: string
  address: string
  emergencyContact: string
  profileImage: string
  medications?: Medication[]
  allergies?: Allergy[]
  prescriptions?: Prescription[]
  reports?: Report[]
}

export type Appointment = {
  id: string
  doctorName: string
  specialty: string
  date: string
  time: string
  status: "confirmed" | "pending" | "completed" | "cancelled"
  type: "online" | "in-person"
  symptoms?: string
}

export type Medication = {
  id: string
  name: string
  dosage: string
  frequency: string
  startedOn?: string
  notes?: string
}

export type Allergy = {
  id: string
  substance: string
  reaction: string
  severity: "mild" | "moderate" | "severe"
}

export type Prescription = {
  id: string
  medication: string
  dosage: string
  prescribedBy: string
  date: string
  instructions?: string
}

export type Report = {
  id: string
  title: string
  type: "lab" | "radiology" | "discharge" | "other"
  date: string
  summary?: string
  fileUrl?: string
}

export const dummyPatient: Patient = {
  id: "P001",
  name: "Reminkumar Dobariya",
  email: "remin@example.com",
  phone: "+91 9876543210",
  age: 21,
  gender: "Male",
  bloodGroup: "B+",
  address: "Gandhinagar, Gujarat",
  emergencyContact: "+91 9876543211",
  profileImage: "/patient-avatar.jpg",
  medications: [
    { id: "m1", name: "Paracetamol", dosage: "500 mg", frequency: "Twice daily", startedOn: "2024-12-20" },
    { id: "m2", name: "Atorvastatin", dosage: "10 mg", frequency: "Once daily at night" },
  ],
  allergies: [
    { id: "a1", substance: "Penicillin", reaction: "Rash", severity: "moderate" },
    { id: "a2", substance: "Peanuts", reaction: "Hives", severity: "severe" },
  ],
  prescriptions: [
    {
      id: "p1",
      medication: "Ibuprofen",
      dosage: "400 mg",
      prescribedBy: "Dr. Sarah Wilson",
      date: "2024-12-18",
      instructions: "Take after meals if pain persists",
    },
  ],
  reports: [
    {
      id: "r1",
      title: "CBC Panel",
      type: "lab",
      date: "2024-12-15",
      summary: "Within normal ranges.",
      fileUrl: "/cbc-lab-report.png",
    },
    {
      id: "r2",
      title: "Chest X-Ray",
      type: "radiology",
      date: "2024-11-28",
      summary: "No acute findings.",
      fileUrl: "/chest-xray-report.png",
    },
  ],
}

export const dummyAppointments: Appointment[] = [
  {
    id: "A001",
    doctorName: "Dr. Punit Gupta",
    specialty: "General Medicine",
    date: "2025-01-05",
    time: "10:00 AM",
    status: "confirmed",
    type: "online",
    symptoms: "Fever, headache, body ache",
  },
  {
    id: "A002",
    doctorName: "Dr. Sarah Wilson",
    specialty: "Cardiology",
    date: "2024-12-18",
    time: "03:00 PM",
    status: "completed",
    type: "in-person",
    symptoms: "Chest discomfort after running",
  },
  {
    id: "A003",
    doctorName: "Dr. Aarav Shah",
    specialty: "Dermatology",
    date: "2025-01-10",
    time: "11:30 AM",
    status: "pending",
    type: "online",
    symptoms: "Skin rash on forearm",
  },
  {
    id: "A004",
    doctorName: "Dr. Nisha Verma",
    specialty: "Neurology",
    date: "2024-11-03",
    time: "02:15 PM",
    status: "completed",
    type: "in-person",
    symptoms: "Recurring headaches",
  },
]

export const lastConsultationDate =
  [...dummyAppointments]
    .filter((a) => a.status === "completed")
    .sort((a, b) => a.date.localeCompare(b.date))
    .at(-1)?.date ?? "2024-12-18"

export const healthTips: { id: string; title: string; description: string }[] = [
  { id: "t1", title: "Stay Hydrated", description: "Aim for 2–3 liters of water per day unless otherwise advised." },
  { id: "t2", title: "Regular Sleep", description: "Maintain 7–8 hours of quality sleep with consistent bedtimes." },
  { id: "t3", title: "Light Exercise", description: "A brisk 20-minute walk boosts cardiovascular health." },
  { id: "t4", title: "Balanced Diet", description: "Add fiber-rich veggies and lean proteins to daily meals." },
]

export const recentActivity: { id: string; label: string; date: string }[] = [
  { id: "ra1", label: "Completed consultation with Dr. Sarah Wilson (Cardiology)", date: "2024-12-18" },
  { id: "ra2", label: "Medication reminder acknowledged", date: "2024-12-19" },
  { id: "ra3", label: "Booked appointment with Dr. Punit Gupta (General Medicine)", date: "2025-01-05" },
  { id: "ra4", label: "Updated emergency contact information", date: "2025-01-01" },
]

export const medications: Medication[] = [
  { id: "m1", name: "Paracetamol", dosage: "500 mg", frequency: "Twice daily", startedOn: "2024-12-20" },
  { id: "m2", name: "Atorvastatin", dosage: "10 mg", frequency: "Once daily at night" },
]

export const allergies: Allergy[] = [
  { id: "a1", substance: "Penicillin", reaction: "Rash", severity: "moderate" },
  { id: "a2", substance: "Peanuts", reaction: "Hives", severity: "severe" },
]

export const prescriptions: Prescription[] = [
  {
    id: "p1",
    medication: "Ibuprofen",
    dosage: "400 mg",
    prescribedBy: "Dr. Sarah Wilson",
    date: "2024-12-18",
    instructions: "Take after meals if pain persists",
  },
]

export const reports: Report[] = [
  {
    id: "r1",
    title: "CBC Panel",
    type: "lab",
    date: "2024-12-15",
    summary: "Within normal ranges.",
    fileUrl: "/cbc-lab-report.png",
  },
  {
    id: "r2",
    title: "Chest X-Ray",
    type: "radiology",
    date: "2024-11-28",
    summary: "No acute findings.",
    fileUrl: "/chest-xray-report.png",
  },
]
