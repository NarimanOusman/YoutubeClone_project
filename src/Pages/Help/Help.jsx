import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, Mail, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Help.css';

export default function Help() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'How do I upload a video?',
      answer:
        'Click the video camera icon in the navigation bar or go to "My Posts". You can either upload a video file from your device or record a video directly using your camera. Fill in the title, description, and click "Post Video".',
    },
    {
      id: 2,
      question: 'Can I record videos directly from my browser?',
      answer:
        'Yes! Click the "Record Video" button in the upload form. Make sure you have granted camera and microphone permissions to your browser. You can pause, resume, and review your recording before uploading.',
    },
    {
      id: 3,
      question: 'How do I edit or delete my videos?',
      answer:
        'Go to "My Posts" and find the video you want to modify. Click the three dots menu next to the video and select "Edit" to update the title and description, or "Delete" to remove it permanently.',
    },
    {
      id: 4,
      question: 'What notifications will I receive?',
      answer:
        'You can receive notifications for: new comments on your videos, replies to your comments, new subscribers, and more. Configure your notification preferences in Settings.',
    },
    {
      id: 5,
      question: 'How do I view notifications?',
      answer:
        'Click the bell icon in the top navigation to see your recent notifications. You can mark notifications as read, delete them, or mark all as read at once.',
    },
    {
      id: 6,
      question: 'Can I make my profile private?',
      answer:
        'Yes! Go to Settings and toggle "Private profile" to make your profile visible only to your followers. You can also disable comments on your videos from there.',
    },
    {
      id: 7,
      question: 'How do I change my video quality preference?',
      answer:
        'Open Settings and go to "Playback & Quality". You can choose your preferred video quality (Auto, 1080p, 720p, 480p, or 360p) and default playback speed.',
    },
    {
      id: 8,
      question: 'How do I contact support or report an issue?',
      answer:
        'You can reach out to us via email at support@vidtube.com or use the contact form on our website. We typically respond within 24 hours.',
    },
    {
      id: 9,
      question: 'Is my data safe and private?',
      answer:
        'Yes, your data is encrypted and stored securely. We use industry-standard security practices and never share your personal information with third parties without your consent.',
    },
    {
      id: 10,
      question: 'Can I download videos from VidTube?',
      answer:
        'Downloading is at the discretion of the video creator. Some videos may have download restrictions enabled. Check the video page for download options.',
    },
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="help-page">
      <div className="help-header">
        <button onClick={() => navigate(-1)} className="help-back" title="Go back">
          <ChevronLeft size={24} />
        </button>
        <h1>Help & Support</h1>
        <div style={{ width: 24 }} />
      </div>

      <div className="help-container">
        {/* Hero Section */}
        <div className="help-hero">
          <h2>How can we help you?</h2>
          <p>Find answers to common questions or get in touch with our support team.</p>
        </div>

        {/* Quick Links */}
        <div className="help-quick-links">
          <div className="quick-link-card">
            <MessageCircle size={28} />
            <h3>Getting Started</h3>
            <p>Learn how to create your first video</p>
          </div>
          <div className="quick-link-card">
            <Mail size={28} />
            <h3>Contact Us</h3>
            <p>support@vidtube.com</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="help-faq-section">
          <h2>Frequently Asked Questions</h2>

          <div className="faq-list">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className={`faq-item ${expandedFaq === faq.id ? 'expanded' : ''}`}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={expandedFaq === faq.id}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={20}
                    className="faq-icon"
                    style={{
                      transform: expandedFaq === faq.id ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>
                {expandedFaq === faq.id && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="help-contact-section">
          <h2>Still need help?</h2>
          <p>Our support team is here to assist you.</p>
          <div className="contact-methods">
            <div className="contact-card">
              <Mail size={32} />
              <h3>Email Support</h3>
              <p>support@vidtube.com</p>
              <a href="mailto:support@vidtube.com" className="contact-link">
                Send Email
              </a>
            </div>
            <div className="contact-card">
              <MessageCircle size={32} />
              <h3>Live Chat</h3>
              <p>Available Monday - Friday, 9 AM - 5 PM</p>
              <button className="contact-link">Start Chat</button>
            </div>
          </div>
        </div>

        {/* Resources Section */}
        <div className="help-resources-section">
          <h2>Resources</h2>
          <div className="resource-links">
            <a href="#" className="resource-link">
              Community Guidelines
            </a>
            <a href="#" className="resource-link">
              Privacy Policy
            </a>
            <a href="#" className="resource-link">
              Terms of Service
            </a>
            <a href="#" className="resource-link">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
