import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Github, Twitter, Linkedin, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-slate-900 dark:text-white">
                Edu<span className="text-brand-600 dark:text-brand-400">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Empowering learners worldwide with production-ready software engineering, cloud architecture, and modern tech skills.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <a href="#" className="hover:text-brand-500 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-brand-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-brand-500 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/courses" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  All Courses
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Web+Development" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/courses?category=DevOps" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Cloud & DevOps
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Data+Science" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Data Science & AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Learning Paths */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Interactive Syllabus
                </a>
              </li>
              <li>
                <a href="#curriculum" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Enterprise Certifications
                </a>
              </li>
              <li>
                <a href="#mentors" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Industry Mentors
                </a>
              </li>
              <li>
                <a href="#community" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Community Discord
                </a>
              </li>
            </ul>
          </div>

          {/* Security & Guarantee */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase mb-4">
              Security & Trust
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>Enterprise Security</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                JWT Refresh Rotation, bcrypt encryption, and secure HttpOnly cookie protection.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} EduHub Platform Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for elite software engineers.
          </p>
        </div>
      </div>
    </footer>
  );
};

