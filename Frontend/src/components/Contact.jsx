import { useState } from 'react';
import { Phone, MapPin, Clock, Mail, Send, MessageCircle, Star, Map } from 'lucide-react';

export default function Contact() {
 

 
 
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">We'd love to hear from you. Get in touch with us!</p>
        </div>

        {/* Map and Contact Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Map Section */}
          <div className="h-full min-h-[400px] lg:min-h-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8125!2d103.8729!3d1.3521!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da1767b42b8c2b%3A0x4e0b4a8c9b5f7e1!2s470%20Serangoon%20Road%2C%20Singapore%20218143!5e0!3m2!1sen!2ssg!4v1630000000000!5m2!1sen!2ssg"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Our Location - Singapore"
              className="h-full w-full"
            ></iframe>
          </div>

          {/* Contact Information */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <p className="text-gray-600 mb-8">Have questions or feedback? Reach out to us through any of these channels.</p>
            
            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Call Us</h3>
                  <p className="text-orange-600">+65 1234 5678</p>
                  <p className="text-sm text-gray-500">Every Day: 8 AM to 11 PM</p>
                </div>
              </div>
              
              {/* Email */}
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Email Us</h3>
                  <p className="text-orange-600">info@govardhanthal.com</p>
                
                </div>
              </div>
              
              {/* Location */}
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Visit Us</h3>
                  <p className="text-gray-700">470 Serangoon Road, Singapore 218143</p>
                </div>
              </div>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
}