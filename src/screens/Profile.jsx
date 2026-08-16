import React, { useState, useRef } from "react";
import { User, Phone, Mail, MapPin, Heart, Shield, Check, Printer, FileText, Calendar, Building, Award, Briefcase, GraduationCap, Home, Camera, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Avatar, SectionTitle } from "../components/primitives";
import { C, LOGO_MARK } from "../theme";
import { fmtDate } from "../utils";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

import { supabase } from "../lib/supabase";

export default function Profile({ session = {}, setSession, db, persist, toast, go, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const s = session || {};
  const fileInputRef = useRef(null);

  // Initialize form state with Form 2 schema fields
  const [form, setForm] = useState({
    name: s.name || "",
    nameBn: s.nameBn || "",
    dob: s.dob || "",
    gender: s.gender || "male",
    bloodGroup: s.bloodGroup || "O+",
    donor: !!s.donor,
    profession: s.profession || "",
    education: s.education || "",
    religion: s.religion || "Islam",
    // Address
    houseNo: s.houseNo || "",
    roadNo: s.roadNo || "",
    block: s.block || "A",
    unit: s.unit || "",
    floorNo: s.floorNo || "",
    holdingNo: s.holdingNo || "",
    area: s.area || "কুঞ্জছায়া আবাসিক এলাকা",
    wardNo: s.wardNo || "২নং জালালাবাদ",
    thana: s.thana || "বায়েজীদ বোস্তামী",
    district: s.district || "চট্টগ্রাম",
    // Contact
    phone: s.phone || "",
    altPhone: s.altPhone || "",
    email: s.email || "",
    // Family
    fatherName: s.fatherName || "",
    motherName: s.motherName || "",
    spouseName: s.spouseName || "",
    // Identification
    idType: s.idType || "NID",
    idNumber: s.idNumber || "",
    photoUrl: s.photoUrl || "",
    bio: s.bio || "",
    pledgeAccepted: s.pledgeAccepted ?? true,
  });

  // Sync form if session updates asynchronously
  React.useEffect(() => {
    if (session && session.id) {
      setForm(prev => ({
        ...prev,
        name: session.name || prev.name,
        nameBn: session.nameBn || prev.nameBn,
        dob: session.dob || prev.dob,
        gender: session.gender || prev.gender,
        bloodGroup: session.bloodGroup || prev.bloodGroup,
        donor: session.donor !== undefined ? session.donor : prev.donor,
        profession: session.profession || prev.profession,
        education: session.education || prev.education,
        religion: session.religion || prev.religion,
        houseNo: session.houseNo || prev.houseNo,
        roadNo: session.roadNo || prev.roadNo,
        block: session.block || prev.block,
        unit: session.unit || prev.unit,
        floorNo: session.floorNo || prev.floorNo,
        holdingNo: session.holdingNo || prev.holdingNo,
        area: session.area || prev.area,
        wardNo: session.wardNo || prev.wardNo,
        thana: session.thana || prev.thana,
        district: session.district || prev.district,
        phone: session.phone || prev.phone,
        altPhone: session.altPhone || prev.altPhone,
        email: session.email || prev.email,
        fatherName: session.fatherName || prev.fatherName,
        motherName: session.motherName || prev.motherName,
        spouseName: session.spouseName || prev.spouseName,
        idType: session.idType || prev.idType,
        idNumber: session.idNumber || prev.idNumber,
        photoUrl: session.photoUrl || prev.photoUrl,
        bio: session.bio || prev.bio,
        pledgeAccepted: session.pledgeAccepted !== undefined ? session.pledgeAccepted : prev.pledgeAccepted,
      }));
    }
  }, [session]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const save = async (overridePhoto) => {
    const photoToSave = overridePhoto !== undefined ? overridePhoto : form.photoUrl;
    if (!form.name.trim()) {
      toast(isBn ? "অনুগ্রহ করে আবেদনকারীর ইংরেজি নাম প্রদান করুন।" : "Please provide the English name.", "error");
      return;
    }
    if (!form.phone.trim()) {
      toast(isBn ? "অনুগ্রহ করে যোগাযোগের মোবাইল নম্বর প্রদান করুন।" : "Please provide a contact phone number.", "error");
      return;
    }

    const formDetails = {
      nameBn: form.nameBn || "",
      dob: form.dob || "",
      gender: form.gender || "male",
      profession: form.profession || "",
      education: form.education || "",
      religion: form.religion || "Islam",
      houseNo: form.houseNo || "",
      roadNo: form.roadNo || "",
      area: form.area || "কুঞ্জছায়া আবাসিক এলাকা",
      floorNo: form.floorNo || "",
      holdingNo: form.holdingNo || "",
      wardNo: form.wardNo || "২নং জালালাবাদ",
      thana: form.thana || "বায়েজীদ বোস্তামী",
      district: form.district || "চট্টগ্রাম",
      altPhone: form.altPhone || "",
      fatherName: form.fatherName || "",
      motherName: form.motherName || "",
      spouseName: form.spouseName || "",
      idType: form.idType || "NID",
      idNumber: form.idNumber || "",
      photoUrl: photoToSave || "",
      bio: form.bio || "",
      pledgeAccepted: form.pledgeAccepted ?? true,
    };

    const updatedUser = {
      ...session,
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      block: form.block,
      unit: form.unit,
      bloodGroup: form.bloodGroup,
      donor: form.donor,
      photoUrl: photoToSave || "",
    };

    // Update in-memory session immediately
    setSession(updatedUser);

    // Update global db state
    persist(d => ({
      ...d,
      users: (d.users || []).map(u => u.id === session.id ? updatedUser : u),
    }));

    // Direct persistence to Supabase
    try {
      const { error } = await supabase.from("profiles").update({
        name: updatedUser.name,
        phone: updatedUser.phone,
        block: updatedUser.block,
        unit: updatedUser.unit,
        blood_group: updatedUser.bloodGroup,
        donor: updatedUser.donor,
        permissions: {
          ...(session.permissions || {}),
          formDetails,
        },
      }).eq("id", session.id);

      if (error) {
        console.error("Direct update error:", error);
      }
    } catch (err) {
      console.error("Supabase profile save error:", err);
    }

    toast(isBn ? "সদস্য ফরম ও ছবি সফলভাবে সংরক্ষিত হয়েছে।" : "Profile and photo successfully saved.");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast(isBn ? "অনুগ্রহ করে একটি ছবি ফাইল (.jpg, .png) নির্বাচন করুন।" : "Please select an image file.", "error");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast(isBn ? "ছবির সাইজ ৮ মেগাবাইটের কম হতে হবে।" : "Image size must be under 8MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 380;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        updateField("photoUrl", dataUrl);
        // Automatically save to database immediately
        save(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    updateField("photoUrl", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
    save("");
  };

  const religions = [
    { key: "Islam", label: isBn ? "ইসলাম" : "Islam" },
    { key: "Hinduism", label: isBn ? "সনাতন (হিন্দু)" : "Hinduism" },
    { key: "Buddhism", label: isBn ? "বৌদ্ধ" : "Buddhism" },
    { key: "Christianity", label: isBn ? "খ্রিস্টান" : "Christianity" },
    { key: "Other", label: isBn ? "অন্যান্য" : "Other" },
  ];

  const idTypes = [
    { key: "NID", label: isBn ? "জাতীয় পরিচয়পত্র (NID)" : "National ID (NID)" },
    { key: "Passport", label: isBn ? "পাসপোর্ট" : "Passport" },
    { key: "Birth Certificate", label: isBn ? "জন্ম নিবন্ধন / অন্যান্য" : "Birth Certificate / Other" },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <SectionTitle>
            {isBn ? "কুঞ্জছায়া ক্লাব — সদস্য ফরম (ফরম-২)" : "Member Profile (Form 2)"}
          </SectionTitle>
          <p className="text-xs -mt-3" style={{ color: C.onSurfaceVariant }}>
            {isBn
              ? "কুঞ্জছায়া আবাসিক এলাকা, বায়েজীদ বোস্তামী থানা রোড, ২নং জালালাবাদ, চট্টগ্রাম।"
              : "Kunjachhaya Residential Area, Bayezid Bostami Road, 2 No. Jalalabad, Chattogram."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Btn
            size="sm"
            variant="outline"
            icon={Printer}
            onClick={() => window.print()}
          >
            {isBn ? "ফরম প্রিন্ট / PDF" : "Print Form"}
          </Btn>
          <Btn size="sm" icon={Check} onClick={save}>
            {isBn ? "সংরক্ষণ করুন" : "Save Changes"}
          </Btn>
        </div>
      </div>

      {/* Profile Overview Card / Membership Card Badge with Integrated Photo Uploader */}
      <Card className="p-6 mb-6 overflow-hidden relative" style={{ backgroundColor: C.surfaceContainerLow }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          
          {/* Photo & Upload Trigger */}
          <div className="relative group shrink-0">
            <Avatar name={form.name || session.name} photoUrl={form.photoUrl || session.photoUrl} size={84} />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
              title={isBn ? "ছবি পরিবর্তন করুন" : "Upload Photo"}
            >
              <Camera size={18} />
              <span className="text-[9px] font-bold mt-0.5">{isBn ? "আপলোড" : "Upload"}</span>
            </button>
            <div
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full text-white text-[10px] flex items-center justify-center shadow"
              style={{ backgroundColor: C.primary }}
              title="Official Photo"
            >
              <Camera size={12} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-extrabold heading text-gray-900 truncate">
                {form.name || session.name}
              </h2>
              {form.nameBn && (
                <span className="text-sm font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {form.nameBn}
                </span>
              )}
            </div>

            <p className="text-xs mb-2.5 flex items-center gap-2 text-gray-600">
              <span>{session.email}</span> · <span>{form.phone || session.phone}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">
                {session.role === "admin" ? (session.post || (isBn ? "কার্যনির্বাহী পরিষদ" : "Admin")) : (isBn ? "সাধারণ সদস্য" : "Resident Member")}
              </Badge>
              <Badge tone="neutral">
                {isBn ? `শ্রেণি: ${session.memberClass}` : `Class: ${session.memberClass}`}
              </Badge>
              {session.bloodGroup && (
                <Badge tone="error">
                  {isBn ? `রক্তের গ্রুপ: ${session.bloodGroup}` : `Blood: ${session.bloodGroup}`}
                </Badge>
              )}
              {session.standingCouncil && (
                <Badge tone="warning">
                  {isBn ? "স্থায়ী পরিষদ সদস্য" : "Standing Council"}
                </Badge>
              )}
            </div>
          </div>

          <div className="sm:border-l sm:pl-5 sm:text-right text-xs space-y-1 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0" style={{ borderColor: C.outlineVariant }}>
            <p className="font-semibold text-gray-500">{isBn ? "সদস্যপদ স্ট্যাটাস" : "Membership Status"}</p>
            <p className="font-bold text-emerald-700 capitalize">{session.status || "Active"}</p>
            <p className="text-[11px] text-gray-400 mt-1">
              {isBn ? "যোগদান:" : "Member since:"} {fmtDate(session.joinedDate)}
            </p>
          </div>
        </div>
      </Card>

      {/* Official Form 2 Passport Photo Box & Identity Stamp Section */}
      <Card className="p-5 mb-6 border-dashed border-2" style={{ borderColor: C.outlineVariant }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-2 text-center relative overflow-hidden bg-gray-50" style={{ borderColor: C.primary }}>
              {form.photoUrl ? (
                <img
                  src={form.photoUrl}
                  alt="Passport Photo"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <ImageIcon size={22} className="mb-1 text-emerald-600" />
                  <span className="text-[9px] font-bold leading-tight text-gray-600">
                    {isBn ? "১ কপি পাসপোর্ট সাইজ ছবি" : "1 Copy Passport Photo"}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">
                {isBn ? "সদস্য পাসপোর্ট সাইজ ছবি সংযুক্তি" : "Passport Size Identification Photo"}
              </h4>
              <p className="text-xs text-gray-500 max-w-md">
                {isBn
                  ? "কুঞ্জছায়া ক্লাব সদস্য ফরম (ফরম-২) অনুসারে সদস্য শনাক্তকরণে ১ কপি স্পষ্ট পাসপোর্ট সাইজ ছবি আপলোড করুন।"
                  : "Upload a clear passport size photograph for official membership verification and directory identification."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Btn
              size="sm"
              icon={Upload}
              onClick={() => fileInputRef.current?.click()}
            >
              {form.photoUrl ? (isBn ? "ছবি পরিবর্তন" : "Change Photo") : (isBn ? "ছবি আপলোড করুন" : "Upload Photo")}
            </Btn>
            {form.photoUrl && (
              <Btn
                size="sm"
                variant="outline"
                icon={Trash2}
                onClick={removePhoto}
              >
                {isBn ? "মুছুন" : "Remove"}
              </Btn>
            )}
          </div>
        </div>
      </Card>

      {/* Main Form Fields Accordion / Sections */}
      <div className="space-y-6">
        
        {/* Section 1: Personal Information (১. আবেদনকারীর নাম ও ব্যক্তিগত তথ্য) */}
        <Card className="p-5">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b" style={{ borderColor: C.outlineVariant }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.primaryContainer, color: "#fff" }}>
              <User size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">
                {isBn ? "১. আবেদনকারীর নাম ও ব্যক্তিগত পরিচয়" : "1. Applicant Name & Personal Details"}
              </h3>
              <p className="text-[11px]" style={{ color: C.onSurfaceVariant }}>
                {isBn ? "ফরম-২ অনুযায়ী পূর্ণ নাম ও জন্ম সংক্রান্ত তথ্য" : "Official identity details per Form 2"}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={isBn ? "আবেদনকারীর নাম (In English)" : "Applicant Name (In English) *"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={form.name}
                onChange={e => updateField("name", e.target.value)}
                placeholder="e.g. Khalid Hasan"
              />
            </Field>

            <Field label={isBn ? "আবেদনকারীর নাম (বাংলায়)" : "Applicant Name (In Bengali)"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={form.nameBn}
                onChange={e => updateField("nameBn", e.target.value)}
                placeholder="উদাঃ খালিদ হাসান"
              />
            </Field>

            <Field label={isBn ? "২. জন্ম তারিখ (Date of Birth)" : "2. Date of Birth"}>
              <input
                type="date"
                style={inputStyle()}
                className={inputCls}
                value={form.dob}
                onChange={e => updateField("dob", e.target.value)}
              />
            </Field>

            <Field label={isBn ? "৩. লিঙ্গ (Gender)" : "3. Gender"}>
              <select
                style={inputStyle()}
                className={inputCls}
                value={form.gender}
                onChange={e => updateField("gender", e.target.value)}
              >
                <option value="male">{isBn ? "পুরুষ (Male)" : "Male"}</option>
                <option value="female">{isBn ? "মহিলা (Female)" : "Female"}</option>
                <option value="other">{isBn ? "অন্যান্য (Other)" : "Other"}</option>
              </select>
            </Field>

            <Field label={isBn ? "৪. রক্তের গ্রুপ (Blood Group)" : "4. Blood Group"}>
              <select
                style={inputStyle()}
                className={inputCls}
                value={form.bloodGroup}
                onChange={e => updateField("bloodGroup", e.target.value)}
              >
                {BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </Field>

            <Field label={isBn ? "৭. ধর্ম (Religion)" : "7. Religion"}>
              <select
                style={inputStyle()}
                className={inputCls}
                value={form.religion}
                onChange={e => updateField("religion", e.target.value)}
              >
                {religions.map(r => (
                  <option key={r.key} value={r.key}>{r.label}</option>
                ))}
              </select>
            </Field>

            <div className="sm:col-span-2 p-3 rounded-xl border flex items-center justify-between" style={{ borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow }}>
              <div className="flex items-center gap-2.5">
                <Heart size={16} className="text-red-500" />
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    {isBn ? "রক্তদাতা হিসেবে জরুরি তালিকায় তালিকাভুক্ত হতে ইচ্ছুক?" : "Register as voluntary blood donor?"}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {isBn ? "ক্লাবের জরুরি ব্লাড ব্যাংকে আপনার রক্তের গ্রুপ ও মোবাইল নম্বর প্রদর্শিত হবে।" : "Enables residents to contact you in medical emergencies."}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={form.donor}
                onChange={e => updateField("donor", e.target.checked)}
                className="w-5 h-5 rounded cursor-pointer text-emerald-600 focus:ring-emerald-500"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Profession & Education (৫. পেশা ও ৬. শিক্ষাগত যোগ্যতা) */}
        <Card className="p-5">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b" style={{ borderColor: C.outlineVariant }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-600 text-white">
              <Briefcase size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">
                {isBn ? "২. পেশা ও শিক্ষাগত যোগ্যতা" : "2. Occupation & Educational Qualifications"}
              </h3>
              <p className="text-[11px]" style={{ color: C.onSurfaceVariant }}>
                {isBn ? "ফরম-২ অনুযায়ী পেশাগত ও শিক্ষাগত বিবরণ" : "Professional & academic background per Form 2"}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={isBn ? "৫. পেশা (Occupation)" : "5. Occupation"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={form.profession}
                onChange={e => updateField("profession", e.target.value)}
                placeholder={isBn ? "উদাঃ ব্যবসায়ী / সরকারি কর্মকর্তা / শিক্ষক / প্রকৌশলী" : "e.g. Businessman / Engineer / Teacher"}
              />
            </Field>

            <Field label={isBn ? "৬. শিক্ষাগত যোগ্যতা (Educational Qualification)" : "6. Education"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={form.education}
                onChange={e => updateField("education", e.target.value)}
                placeholder={isBn ? "উদাঃ বি.এসসি / এম.এ / স্নাতক" : "e.g. B.Sc / M.A / Graduation"}
              />
            </Field>
          </div>
        </Card>

        {/* Section 3: Address & Residence (৮. ঠিকানা ও বাসস্থান বিবরণ) */}
        <Card className="p-5">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b" style={{ borderColor: C.outlineVariant }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-600 text-white">
              <Home size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">
                {isBn ? "৩. ঠিকানা ও কুঞ্জছায়া আবাসিক এলাকা বিবরণ (ধারা-৮)" : "3. Residential & Unit Address (Article 8)"}
              </h3>
              <p className="text-[11px]" style={{ color: C.onSurfaceVariant }}>
                {isBn ? "বাসা নং, রোড নং, ব্লক, ফ্ল্যাট/ইউনিট এবং এলাকা সংক্রান্ত তথ্য" : "House, road, block, floor, holding and plot details"}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Field label={isBn ? "বাসা # (House No.)" : "House #"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={form.houseNo}
                onChange={e => updateField("houseNo", e.target.value)}
                placeholder="e.g. 12"
              />
            </Field>

            <Field label={isBn ? "রোড # (Road No.)" : "Road #"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={form.roadNo}
                onChange={e => updateField("roadNo", e.target.value)}
                placeholder="e.g. 04"
              />
            </Field>

            <Field label={isBn ? "ব্লক # (Block)" : "Block *"}>
              <select
                style={inputStyle()}
                className={inputCls}
                value={form.block}
                onChange={e => updateField("block", e.target.value)}
              >
                {["A", "B", "C", "D", "E", "F"].map(b => (
                  <option key={b} value={b}>{isBn ? `ব্লক ${b}` : `Block ${b}`}</option>
                ))}
              </select>
            </Field>

            <Field label={isBn ? "ফ্ল্যাট / ইউনিট নং (Unit #)" : "Unit / Flat #"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={form.unit}
                onChange={e => updateField("unit", e.target.value)}
                placeholder="e.g. 4B"
              />
            </Field>

            <Field label={isBn ? "ফ্লোর # (Floor No.)" : "Floor #"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={form.floorNo}
                onChange={e => updateField("floorNo", e.target.value)}
                placeholder="e.g. 4th Floor"
              />
            </Field>

            <Field label={isBn ? "হোল্ডিং / প্লট নং #" : "Holding / Plot #"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={form.holdingNo}
                onChange={e => updateField("holdingNo", e.target.value)}
                placeholder="e.g. Plot-102"
              />
            </Field>

            <Field label={isBn ? "এলাকা (Area)" : "Area"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={form.area}
                onChange={e => updateField("area", e.target.value)}
                placeholder="কুঞ্জছায়া আবাসিক এলাকা"
              />
            </Field>

            <Field label={isBn ? "ওয়ার্ড নং (Ward No.)" : "Ward No."}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={form.wardNo}
                onChange={e => updateField("wardNo", e.target.value)}
                placeholder="২নং জালালাবাদ"
              />
            </Field>

            <Field label={isBn ? "থানা ও জেলা (Thana & District)" : "Thana & District"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={`${form.thana}, ${form.district}`}
                disabled
              />
            </Field>
          </div>
        </Card>

        {/* Section 4: Contact Information (৯. যোগাযোগের নম্বর ও ১০. ইমেইল) */}
        <Card className="p-5">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b" style={{ borderColor: C.outlineVariant }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-600 text-white">
              <Phone size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">
                {isBn ? "৪. যোগাযোগের তথ্য (Contact Information)" : "4. Contact Details"}
              </h3>
              <p className="text-[11px]" style={{ color: C.onSurfaceVariant }}>
                {isBn ? "প্রাথমিক ফোন, বিকল্প জরুরি নম্বর ও ইমেইল" : "Mobile, emergency alternate number, and email"}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Field label={isBn ? "৯. যোগাযোগের মোবাইল নম্বর *" : "Primary Mobile Number *"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={form.phone}
                onChange={e => updateField("phone", e.target.value)}
                placeholder="+880 1XXX-XXXXXX"
              />
            </Field>

            <Field label={isBn ? "বিকল্প / জরুরি নম্বর (Alternative Number)" : "Alternative Emergency Number"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={form.altPhone}
                onChange={e => updateField("altPhone", e.target.value)}
                placeholder="+880 1XXX-XXXXXX"
              />
            </Field>

            <Field label={isBn ? "১০. ইমেইল ঠিকানা (Email Address)" : "Email Address"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={form.email}
                disabled
                placeholder="user@example.com"
              />
            </Field>
          </div>
        </Card>

        {/* Section 5: Family Information (১১. পিতার নাম, ১২. মাতার নাম, ১৩. স্বামী/স্ত্রী) */}
        <Card className="p-5">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b" style={{ borderColor: C.outlineVariant }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-600 text-white">
              <Heart size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">
                {isBn ? "৫. পারিবারিক তথ্য (Family Information)" : "5. Family Background"}
              </h3>
              <p className="text-[11px]" style={{ color: C.onSurfaceVariant }}>
                {isBn ? "পিতা, মাতা এবং স্বামী/স্ত্রীর নাম সংক্রান্ত তথ্য" : "Parents and spouse details per Form 2"}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Field label={isBn ? "১১. পিতার নাম (Father's Name)" : "11. Father's Name"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={form.fatherName}
                onChange={e => updateField("fatherName", e.target.value)}
                placeholder={isBn ? "পিতার পূর্ণ নাম" : "Father's Full Name"}
              />
            </Field>

            <Field label={isBn ? "১২. মাতার নাম (Mother's Name)" : "12. Mother's Name"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={form.motherName}
                onChange={e => updateField("motherName", e.target.value)}
                placeholder={isBn ? "মাতার পূর্ণ নাম" : "Mother's Full Name"}
              />
            </Field>

            <Field label={isBn ? "১৩. স্বামীর/স্ত্রীর নাম (Spouse's Name)" : "13. Spouse's Name"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={form.spouseName}
                onChange={e => updateField("spouseName", e.target.value)}
                placeholder={isBn ? "স্বামী বা স্ত্রীর পূর্ণ নাম" : "Spouse's Full Name"}
              />
            </Field>
          </div>
        </Card>

        {/* Section 6: Attachments & Identity Document (১৪. সংযুক্তি - জাতীয় পরিচয়পত্র / পাসপোর্ট) */}
        <Card className="p-5">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b" style={{ borderColor: C.outlineVariant }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 text-white">
              <Shield size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">
                {isBn ? "৬. সংযুক্তি ও পরিচয়পত্র (১৪. সংযুক্তি - যেকোনো একটি)" : "6. Identity & Document Attachment (Item 14)"}
              </h3>
              <p className="text-[11px]" style={{ color: C.onSurfaceVariant }}>
                {isBn ? "জাতীয় পরিচয়পত্র, পাসপোর্ট বা জন্ম নিবন্ধন নম্বর" : "National ID, Passport, or Birth Registration ID"}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={isBn ? "সংযুক্তির ধরন (Document Type)" : "Attachment Type"}>
              <select
                style={inputStyle()}
                className={inputCls}
                value={form.idType}
                onChange={e => updateField("idType", e.target.value)}
              >
                {idTypes.map(it => (
                  <option key={it.key} value={it.key}>{it.label}</option>
                ))}
              </select>
            </Field>

            <Field label={isBn ? "পরিচয়পত্র / সংযুক্তি নম্বর (ID Number)" : "Document / ID Number"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={form.idNumber}
                onChange={e => updateField("idNumber", e.target.value)}
                placeholder="e.g. 19901592XXXXXXXXX"
              />
            </Field>
          </div>
        </Card>

        {/* Section 7: Brief Bio / About Self (নিজের সম্পর্কে সংক্ষিপ্ত বর্ণনা) */}
        <Card className="p-5">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b" style={{ borderColor: C.outlineVariant }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-600 text-white">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">
                {isBn ? "৭. নিজের সম্পর্কে সংক্ষিপ্ত বর্ণনা" : "7. Brief Bio / About Self"}
              </h3>
              <p className="text-[11px]" style={{ color: C.onSurfaceVariant }}>
                {isBn ? "ক্লাবের উন্নয়ন, সমাজসেবা বা ক্রীড়া কার্যক্রমে আপনার বিশেষ অভিজ্ঞতা বা আগ্রহ" : "Your background and interests for club activities"}
              </p>
            </div>
          </div>

          <Field label={isBn ? "সংক্ষিপ্ত বিবরণ" : "Bio"}>
            <textarea
              rows={4}
              style={inputStyle()}
              className={inputCls}
              value={form.bio}
              onChange={e => updateField("bio", e.target.value)}
              placeholder={isBn ? "নিজের পেশাগত অভিজ্ঞতা, ক্লাবের কার্যক্রমে অবদানের ক্ষেত্র ইত্যাদি লিখুন…" : "Describe your background, skills, and community interests…"}
            />
          </Field>
        </Card>

        {/* Section 8: Constitutional Declaration / অঙ্গীকার নামা */}
        <Card className="p-5 border-2 border-emerald-600/30 bg-emerald-50/50">
          <h3 className="font-bold text-base text-emerald-950 mb-2 heading text-center">
            {isBn ? "অঙ্গীকার নামা" : "Official Declaration & Pledge"}
          </h3>
          <div className="p-4 rounded-xl bg-white border border-emerald-200 text-xs text-gray-800 leading-relaxed space-y-2 mb-4">
            <p>
              {isBn
                ? "“আমি নিম্নস্বাক্ষরকারী কুঞ্জছায়া ক্লাব এর সংবিধান/গঠনতন্ত্র মতে আমার উপর অর্পিত দায়িত্ব যথাযথ পালন করতে বাধ্য থাকবো। সংগঠনের নিয়ম বহির্ভূত কোন কর্মকাণ্ডে জড়িত থাকবো না। সংগঠনের উন্নয়নের স্বার্থে সর্বাধিক পরামর্শ এবং সহযোগিতা করবো। আমি স্ব-জ্ঞানে, স্ব-ইচ্ছায় এই সংগঠনের সদস্য হওয়ার আবেদন করলাম।”"
                : "“I, the undersigned, hereby pledge to abide by the constitution, rules, and regulations of Kunjachhaya Club. I will diligently perform duties entrusted to me, uphold community harmony, avoid any anti-organizational activity, and contribute to the club's development. I willingly apply for membership of this organization with full awareness and consent.”"}
            </p>
          </div>

          <label className="flex items-start gap-3 p-3 rounded-lg bg-emerald-100/60 border border-emerald-300 cursor-pointer">
            <input
              type="checkbox"
              checked={form.pledgeAccepted}
              onChange={e => updateField("pledgeAccepted", e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500"
            />
            <span className="text-xs font-semibold text-emerald-950 select-none">
              {isBn
                ? "আমি অঙ্গীকার নামা এবং ক্লাবের পূর্ণ সংবিধানের সকল ধারা ও শর্তাবলি পড়েছি এবং এতে পূর্ণ সম্মতি জ্ঞাপন করছি।"
                : "I have read and fully agreed to the constitutional pledge and terms of Kunjachhaya Club."}
            </span>
          </label>
        </Card>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
          <button
            onClick={() => go("legal")}
            className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-700 transition-colors"
          >
            <Shield size={14} />
            {isBn ? "গোপনীয়তা নীতিমালা ও ব্যবহারের শর্তাবলী" : "Privacy & Terms of Service"}
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Btn
              variant="outline"
              icon={Printer}
              onClick={() => window.print()}
            >
              {isBn ? "প্রিন্ট ফরম-২" : "Print Form 2"}
            </Btn>
            <Btn icon={Check} onClick={save}>
              {isBn ? "সদস্য ফরম সংরক্ষণ করুন" : "Save Member Profile"}
            </Btn>
          </div>
        </div>

      </div>
    </div>
  );
}
