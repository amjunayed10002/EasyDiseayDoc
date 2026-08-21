import React from "react";
import { ContactAdminInfo, Language } from "../types";
import { Mail, Phone, X } from "lucide-react";

interface ContactEDModalProps {
  language: Language;
  contact: ContactAdminInfo;
  onClose: () => void;
}

export const ContactEDModal: React.FC<ContactEDModalProps> = ({ language, contact, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
    <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 text-gray-400 hover:text-gray-700">
        <X className="h-5 w-5" />
      </button>
      <h2 className="pr-8 text-xl font-black text-[#1B5E20]">{language === "bn" ? "Contact ED" : "Contact ED"}</h2>
      <p className="mt-2 text-sm text-gray-600">{contact.description}</p>
      <div className="mt-5 space-y-3 text-sm font-bold text-gray-800">
        <a className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3" href={`mailto:${contact.email}`}>
          <Mail className="h-5 w-5 text-emerald-700" /> {contact.email}
        </a>
        <a className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3" href={`tel:${contact.phone}`}>
          <Phone className="h-5 w-5 text-emerald-700" /> {contact.phone}
        </a>
      </div>
    </div>
  </div>
);
