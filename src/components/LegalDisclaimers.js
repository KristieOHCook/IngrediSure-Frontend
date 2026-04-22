import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../AccessibilityContext';
import ReadAloudButton from './ReadAloudButton';

const BG = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=90';

const DISCLAIMERS = [
  {
    title: 'NOT MEDICAL ADVICE',
    icon: '⚕️',
    color: '#ff6b6b',
    content: `IngrediSure is a wellness information and ingredient awareness tool. It is NOT a medical device, NOT a clinical decision support tool, and NOT a substitute for professional medical advice, diagnosis, or treatment. The information provided by IngrediSure should never be used as the sole basis for any health or dietary decision.

Always seek the advice of your qualified healthcare provider, registered dietitian, or licensed pharmacist with any questions you may have regarding a medical condition, medication, or dietary change. Never disregard professional medical advice or delay seeking it because of information you found on IngrediSure.`,
  },
  {
    title: 'INGREDIENT & SAFETY INFORMATION',
    icon: '🔍',
    color: '#f0c040',
    content: `IngrediSure's safety verdicts (Safe, Caution, Unsafe) are generated based on general ingredient analysis algorithms and the health information you voluntarily provide in your personal health profile. These verdicts:

- Are NOT clinically validated medical assessments
- May not account for every individual medical circumstance
- Are based on commonly known ingredient-condition relationships and are NOT exhaustive
- May not reflect the most current medical or scientific research
- Cannot account for individual tolerance, dosage sensitivity, or unique medical histories
- Should not be used to determine whether a food is safe for a person with severe allergies or life-threatening conditions without consulting a medical professional

IngrediSure makes no warranty, express or implied, about the accuracy, completeness, or reliability of any safety verdict.`,
  },
  {
    title: 'FOOD-DRUG INTERACTION INFORMATION',
    icon: '💊',
    color: '#fd79a8',
    content: `The food-drug interaction information provided by IngrediSure is for general educational awareness only. It is based on publicly available general information and is NOT:

- A substitute for consultation with a licensed pharmacist or physician
- A complete or exhaustive list of all possible interactions
- Personalized to your specific medication dosage, frequency, or medical history
- Validated by clinical review for your individual situation

Always consult your pharmacist or prescribing physician before making any dietary changes related to your medications. Drug-food interactions can vary significantly based on individual factors that IngrediSure cannot assess.`,
  },
  {
    title: 'HEALTH PROFILE DATA',
    icon: '🔒',
    color: '#74b9ff',
    content: `The health profile information you enter into IngrediSure (including medical conditions, medications, and dietary restrictions) is self-reported by you. IngrediSure:

- Does not verify the accuracy of your self-reported health information
- Is not responsible for incorrect or incomplete health profile entries
- Does not access, connect to, or retrieve information from any external medical records system unless you explicitly initiate that connection
- Stores your health profile data to provide personalized safety analysis

The accuracy of IngrediSure's safety verdicts depends entirely on the accuracy and completeness of the health information you provide. IngrediSure cannot be held responsible for safety verdicts based on incomplete or inaccurate user-provided health data.`,
  },
  {
    title: 'ALLERGEN WARNING',
    icon: '⚠️',
    color: '#ff6b6b',
    content: `IngrediSure is NOT intended to be used as a primary safety tool for individuals with severe food allergies, anaphylaxis risk, or life-threatening dietary conditions. Users with severe allergies must:

- Always read ingredient labels personally on every product
- Consult with a board-certified allergist for management of severe food allergies
- Never rely solely on IngrediSure to determine whether a food is safe for a life-threatening allergy
- Contact manufacturers directly to verify ingredient information and potential cross-contamination

For severe allergies, IngrediSure should be used as a supplementary awareness tool only, never as a primary safety determination method.`,
  },
  {
    title: 'NO DOCTOR-PATIENT RELATIONSHIP',
    icon: '👨‍⚕️',
    color: '#a29bfe',
    content: `Use of IngrediSure does not create a doctor-patient, dietitian-client, or any other healthcare provider relationship between you and IngrediSure, its creators, or its operators. No healthcare professional is involved in generating the safety information or verdicts provided by IngrediSure.

IngrediSure is a technology tool that applies general ingredient-condition matching algorithms. It does not employ, consult with, or receive oversight from any licensed medical or dietary professional in the generation of individual safety verdicts.`,
  },
  {
    title: 'LIMITATION OF LIABILITY',
    icon: '⚖️',
    color: '#e8c49a',
    content: `To the fullest extent permitted by applicable law, IngrediSure, its creators, developers, and operators shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from:

- Reliance on any safety verdict, ingredient information, or health information provided by IngrediSure
- Any dietary change made based on information from IngrediSure
- Any adverse health outcome related to use of IngrediSure
- Any inaccurate, incomplete, or outdated information in the IngrediSure database
- Technical errors, outages, or data inaccuracies

By using IngrediSure, you acknowledge and agree that you assume full responsibility for any dietary or health decisions made using information from this application.`,
  },
  {
    title: 'ACCESSIBILITY & LANGUAGE',
    icon: '♿',
    color: '#55efc4',
    content: `IngrediSure provides multi-language support and accessibility features as a courtesy to users. Please be aware that:

- Translations are machine-generated and may not be perfectly accurate for medical or dietary terminology
- Medical terminology translations should be verified with a qualified healthcare professional who speaks the relevant language
- The audio read-aloud feature uses device speech synthesis and may not perfectly pronounce all medical or ingredient terms
- ASL resources link to third-party content that IngrediSure does not control or verify

IngrediSure is committed to improving accessibility and language accuracy over time.`,
  },
  {
    title: 'CHILDREN & FAMILY USE',
    icon: '👨‍👩‍👧',
    color: '#fdcb6e',
    content: `IngrediSure's Family Hub feature allows users to create health profiles for family members of all ages. Please note:

- Health profiles for minors (under 18) should be created and managed by a parent or legal guardian
- Dietary decisions for children, infants, or individuals with special medical needs should always involve a qualified pediatrician or healthcare provider
- IngrediSure's ingredient safety analysis is based on general adult dietary guidelines unless specific conditions are entered for the family member
- IngrediSure is not specifically validated for pediatric dietary management

Parents and guardians are responsible for verifying the appropriateness of any dietary information for their children.`,
  },
  {
    title: 'EMERGENCY SITUATIONS',
    icon: '🚨',
    color: '#ff2222',
    content: `IngrediSure is NOT an emergency response tool. If you or someone else is experiencing a medical emergency, including a severe allergic reaction, anaphylaxis, or any life-threatening condition:

CALL 911 (or your local emergency number) IMMEDIATELY.

Do not use IngrediSure to assess or manage a medical emergency. IngrediSure provides no emergency response capabilities and should never be used in place of emergency medical services.`,
  },
];

export default function LegalDisclaimers() {
  const navigate = useNavigate();
  const { fontSize } = useAccessibility();

  const bodySize = fontSize === 'extraLarge' ? '16px' : fontSize === 'large' ? '14px' : '13px';

  const fullDisclaimerText = DISCLAIMERS.map(d => `${d.title}: ${d.content}`).join('\n\n');

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.75) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '6px' }}>INGREDISURE</div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '400', color: '#ffffff', letterSpacing: '1px' }}>Legal Disclaimers</h1>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', fontStyle: 'italic' }}>
              Last updated: April 2026
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <ReadAloudButton text={fullDisclaimerText} />
            <button onClick={() => navigate('/dashboard')}
              style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 20px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}>
              ← DASHBOARD
            </button>
            <button onClick={() => navigate('/my-profile')}
              style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 20px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}>
              MY PROFILE
            </button>
          </div>
        </div>

        {/* Intro */}
        <div style={{ padding: '20px 24px', background: 'rgba(255,107,107,0.12)', border: '2px solid rgba(255,107,107,0.4)', borderRadius: '4px', marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', color: '#ff9999', letterSpacing: '2px', marginBottom: '8px', fontWeight: '700' }}>
            ⚕️ IMPORTANT — PLEASE READ
          </div>
          <p style={{ color: '#ffffff', fontSize: bodySize, lineHeight: '1.9', margin: 0 }}>
            By using IngrediSure you acknowledge that this application is a wellness information tool only and is NOT a medical device or substitute for professional medical advice. The following disclaimers govern your use of IngrediSure and protect both you and us. Please read them carefully.
          </p>
        </div>

        {/* Individual disclaimers */}
        {DISCLAIMERS.map((d, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', border: `1px solid ${d.color}25`, borderLeft: `4px solid ${d.color}`, borderRadius: '4px', padding: '20px 24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '20px' }}>{d.icon}</span>
              <div style={{ fontSize: '12px', color: d.color, letterSpacing: '2px', fontWeight: '700' }}>{d.title}</div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: bodySize, lineHeight: '1.9', whiteSpace: 'pre-line' }}>
              {d.content}
            </div>
          </div>
        ))}

        {/* Agreement statement */}
        <div style={{ padding: '24px', background: 'rgba(232,196,154,0.1)', border: '1px solid rgba(232,196,154,0.3)', borderRadius: '4px', marginTop: '8px' }}>
          <div style={{ fontSize: '12px', color: '#e8c49a', letterSpacing: '2px', marginBottom: '10px', fontWeight: '700' }}>
            BY USING INGREDISURE YOU AGREE
          </div>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: bodySize, lineHeight: '1.9', margin: 0 }}>
            By accessing and using IngrediSure, you acknowledge that you have read, understood, and agree to be bound by all of the disclaimers and limitations of liability stated on this page. You agree that IngrediSure is a wellness information tool only, that you will consult qualified healthcare professionals for medical advice, and that you assume full personal responsibility for any dietary or health decisions made using information from this application.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontStyle: 'italic' }}>
          © 2026 IngrediSure. All rights reserved. | Eat Well. Choose Wisely.
        </div>

      </div>
    </div>
  );
}