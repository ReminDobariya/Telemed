export type Sender = "ai" | "patient"

export type ChatMessage = {
  id: string | number
  message: string
  sender: Sender
  timestamp: string
}

export type Assessment = {
  title: string
  summary: string
  suggestedSpecialty: string
  urgency: "low" | "medium" | "high"
  actions: string[]
}

export const aiResponses: Record<string, string> = {
  fever:
    "I understand you have fever. This could be due to a viral infection. Stay hydrated and rest. Consider consulting a General Medicine doctor if fever persists beyond 48 hours.",
  headache:
    "Headaches can have various causes. If persistent or severe, consult a Neurologist. Try hydration, caffeine moderation, and resting in a dark, quiet room.",
  "chest pain":
    "Chest pain requires immediate attention. If pain is severe, radiating, or accompanied by breathlessness, seek emergency care. Consider a Cardiologist consultation.",
  cough:
    "A cough can be viral or allergic. Track duration and any fever/shortness of breath. Consider General Medicine or Pulmonology if it persists more than two weeks.",
  rash: "Skin rashes have many causes, including allergic reactions. Avoid scratching and consider a Dermatology consultation if it spreads or worsens.",
  fatigue:
    "Fatigue can be related to sleep, nutrition, hydration, or stress. If persistent, consider a General Medicine check-up and basic blood work.",
  dizziness:
    "Dizziness may be due to dehydration, low blood sugar, or ear issues. Hydrate and rest. Persistent symptoms may need a Neurologist or ENT evaluation.",
  anxiety:
    "Anxiety is common and manageable. Try breathing exercises and mindfulness. If persistent, consider speaking with a Psychologist or Psychiatrist.",
  cold: "Common cold is usually viral. Hydrate, rest, and consider saline nasal rinses. If symptoms persist or worsen, consult General Medicine.",
  flu: "Flu symptoms include fever, aches, cough. Rest and hydration are key. Seek care if you’re in a high-risk group or symptoms are severe.",
  "back pain":
    "For back pain, consider posture checks, gentle stretching, and heat therapy. Persistent pain warrants an Orthopedics or Physiotherapy consult.",
  "sore throat":
    "Sore throat can be viral or bacterial. Warm fluids and throat lozenges may help. If severe or with high fever, consult General Medicine.",
  migraine:
    "Migraines can be triggered by stress, diet, and sleep changes. Track triggers and consider Neurology if frequent or disabling.",
  diarrhea:
    "Diarrhea requires fluids/electrolytes. If blood is present, or you have high fever or dehydration, seek medical care promptly.",
  "shortness of breath":
    "Shortness of breath needs urgent evaluation, especially with chest pain. Seek emergency care and consider Cardiologist/Pulmonologist follow-up.",
  allergy:
    "Allergies can respond to antihistamines. Track triggers. Consider an Allergist or Dermatologist for persistent concerns.",
  insomnia:
    "Practice sleep hygiene: consistent schedule, low light, no screens before bed. Persistent insomnia may benefit from behavioral therapy.",
  hypertension:
    "Monitor blood pressure regularly, reduce salt, and maintain exercise. Consult Cardiology/General Medicine for medication review.",
  diabetes:
    "Track blood sugar, stick to a balanced diet, and exercise. Regular follow-ups with Endocrinology/General Medicine are recommended.",
  asthma: "Use prescribed inhalers as directed. Avoid known triggers. Pulmonology follow-up can optimize your control.",
}

// Simple keyword detection with a priority order
const priority = [
  "chest pain",
  "shortness of breath",
  "fever",
  "headache",
  "cough",
  "rash",
  "back pain",
  "migraine",
  "sore throat",
  "diarrhea",
  "fatigue",
  "dizziness",
  "anxiety",
  "cold",
  "flu",
  "allergy",
  "insomnia",
  "hypertension",
  "diabetes",
  "asthma",
]

export function detectKeywords(text: string): string[] {
  const lower = text.toLowerCase()
  const found = priority.filter((k) => lower.includes(k))
  return found.length ? found : []
}

export function buildAssessment(keywords: string[]): Assessment | null {
  if (!keywords.length) return null
  // Map top keyword to suggested specialty and urgency
  const top = keywords[0]
  switch (top) {
    case "chest pain":
      return {
        title: "Urgent Symptom: Chest Pain",
        summary:
          "Chest pain may indicate a serious cardiac issue, especially if accompanied by breathlessness, sweating, or radiating pain.",
        suggestedSpecialty: "Cardiology",
        urgency: "high",
        actions: ["Seek immediate medical attention", "Avoid strenuous activity", "Prepare for ECG evaluation"],
      }
    case "shortness of breath":
      return {
        title: "Breathing Difficulty",
        summary:
          "Shortness of breath can be related to cardiac or respiratory causes and needs timely evaluation if persistent or severe.",
        suggestedSpecialty: "Cardiology / Pulmonology",
        urgency: "high",
        actions: ["Seek urgent evaluation", "Monitor oxygen saturation if available", "Avoid exertion"],
      }
    case "fever":
      return {
        title: "Fever Assessment",
        summary: "Likely viral; track duration and associated symptoms like cough, sore throat, or body aches.",
        suggestedSpecialty: "General Medicine",
        urgency: "medium",
        actions: ["Hydrate and rest", "Use antipyretics as directed", "Consult if >48 hours or very high fever"],
      }
    case "headache":
    case "migraine":
      return {
        title: "Headache Assessment",
        summary: "Headache causes vary; persistent or severe headaches warrant a targeted clinical evaluation.",
        suggestedSpecialty: "Neurology",
        urgency: "medium",
        actions: ["Hydrate, rest in dark room", "Track triggers", "Consult if frequent or worsening"],
      }
    case "rash":
      return {
        title: "Dermatologic Concern",
        summary: "Skin rashes are often benign but may spread or signal allergy/infection.",
        suggestedSpecialty: "Dermatology",
        urgency: "low",
        actions: ["Avoid scratching", "Use gentle emollients", "Consult if spreading/worsening"],
      }
    default:
      return {
        title: "General Assessment",
        summary:
          "Your symptoms may benefit from routine evaluation and lifestyle adjustments. Consider a targeted specialty if symptoms persist.",
        suggestedSpecialty: "General Medicine",
        urgency: "low",
        actions: ["Monitor symptoms", "Hydrate and rest", "Book a routine consultation"],
      }
  }
}

export function getAIResponse(userMessage: string): { reply: string; assessment: Assessment | null } {
  const matches = detectKeywords(userMessage)
  const reply =
    matches.length > 0
      ? (aiResponses[matches[0]] ?? "I recommend monitoring your symptoms and consulting a physician if they persist.")
      : "Thank you for sharing. Could you describe your symptoms, duration, and any related triggers? I can suggest next steps."
  const assessment = buildAssessment(matches)
  return { reply, assessment }
}
