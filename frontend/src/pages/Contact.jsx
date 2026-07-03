import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import { sendContact } from '../utils/api';
import {
  FiMail, FiSend, FiCopy, FiCheck, FiMapPin,
  FiGithub, FiLinkedin, FiTwitter, FiInstagram
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Contact.css';

export default function Contact() {
  const { data: portfolioData } = usePortfolio();
  const profile = portfolioData?.profile || {};
  const social  = profile.social || {};

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [sending, setSending] = useState(false);
  const [copied, setCopied]   = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCopyEmail = () => {
    const email = profile.email || 'ujjwal@example.com';
    navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success('Email copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSending(true);
    toast.loading('Sending message...', { id: 'contact-send' });

    try {
      const res = await sendContact(formData);
      if (res.data?.success) {
        toast.success('Message sent successfully! I will get back to you soon.', { id: 'contact-send' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(res.data?.message || 'Failed to send message', { id: 'contact-send' });
      }
    } catch (err) {
      toast.error('Failed to send message. Please try emailing directly.', { id: 'contact-send' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page page">

      {/* Orbs */}
      <div className="orb orb-violet" style={{ width: 500, height: 500, top: '10%', left: '-10%', opacity: 0.4 }} />
      <div className="orb orb-cyan" style={{ width: 400, height: 400, top: '50%', right: '-10%', opacity: 0.4 }} />

      <div className="container">

        <div className="section-header">
          <div className="section-tag">📬 Get In Touch</div>
          <h2>Let's Build Something <span className="gradient-text">Great Together</span></h2>
          <p>Have a project in mind, an opportunity, or just want to say hi? Drop me a line!</p>
        </div>

        <div className="contact-grid">

          {/* ── LEFT PANEL: Contact Info & Copy Email ── */}
          <motion.div
            className="contact-info-panel glass-card"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3>Contact Information</h3>
            <p className="contact-subtext">Feel free to reach out via email or connect on social media.</p>

            <div className="contact-details">

              {/* Email Copy Card */}
              <div className="contact-item-card">
                <div className="contact-item-icon"><FiMail /></div>
                <div className="contact-item-text">
                  <span className="contact-item-label">Direct Email</span>
                  <div className="email-copy-row">
                    <span className="email-val mono">{profile.email || 'ujjwal@example.com'}</span>
                    <button className="copy-btn" onClick={handleCopyEmail} title="Copy email">
                      {copied ? <FiCheck className="copied-icon" /> : <FiCopy />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="contact-item-card">
                <div className="contact-item-icon cyan"><FiMapPin /></div>
                <div className="contact-item-text">
                  <span className="contact-item-label">Location</span>
                  <span className="contact-val">{profile.location || 'India'}</span>
                </div>
              </div>

            </div>

            {/* Social Links */}
            <div className="contact-socials-wrap">
              <span className="socials-label">Connect with me:</span>
              <div className="socials-list">
                {social.github    && <a href={social.github} target="_blank" rel="noreferrer" className="social-btn"><FiGithub /></a>}
                {social.linkedin  && <a href={social.linkedin} target="_blank" rel="noreferrer" className="social-btn"><FiLinkedin /></a>}
                {social.twitter   && <a href={social.twitter} target="_blank" rel="noreferrer" className="social-btn"><FiTwitter /></a>}
                {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" className="social-btn"><FiInstagram /></a>}
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT PANEL: Contact Form ── */}
          <motion.div
            className="contact-form-panel glass-card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3>Send Me a Message</h3>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Your Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Project Inquiry / Opportunity"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project or message..."
                  required
                />
              </div>

              <button
                type="submit"
                className={`btn btn-primary submit-btn ${sending ? 'disabled' : ''}`}
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send Message'} <FiSend />
              </button>
            </form>
          </motion.div>

        </div>

      </div>
    </div>
  );
}