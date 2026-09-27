"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import StudentRosterEditForm from "./StudentRosterEditForm";

const VALID_SECTIONS = ["All", "4A", "4B", "4C", "4D", "4E", "5B"];

const SEED_DATA = [
  { student: "Leah Valentina Vásquez Leiva", p1Name: "Olga Maribel Acevedo", p1Email: "" },
  { student: "Max Joseph Sabillon Aguilar", p1Name: "Delmi Yaquelínd Aguilar López", p1Email: "aguilarlopez2024@gmail.com" },
  { student: "Camila Elizabeth Cortes Aguilar", p1Name: "Zabdi Katherine Aguilar Ordóñez", p1Email: "zabdikao@hotmail.com", p2Name: "José Enrique Aguilar", p2Email: "joaguilar1957@gmail.com" },
  { student: "Karla Sofia Aguilar Elvir", p1Name: "Ivan Enrique Aguilar Ramirez", p1Email: "ivanramiz0078@gmail.com", p2Name: "Karla Maria Elvir Martinez", p2Email: "karlaelvirmar38@gmail.com" },
  { student: "Matias Rodriguez Aguilar", p1Name: "Sofía Carolina Aguilar Silva", p1Email: "sofiaguilar77@gmail.com" },
  { student: "Abdiel Isaac Alba Martinez", p1Name: "René otoniel Alba Alberto", p1Email: "" },
  { student: "Cristian Daniel Sosa Aleman", p1Name: "Sendi Jasmín Alemán Ramos", p1Email: "sendi.aleman225@gmail.com" },
  { student: "Adriana Lucia Almendarez Salgado", p1Name: "Víctor Hugo Almendárez Rodríguez", p1Email: "vhar.2007@gmail.com" },
  { student: "Ariana Lily Zavala Alvarado", p1Name: "Enma Lily Alvarado López", p1Email: "enmalily_alvarado@hotmail.com" },
  { student: "Emily Roxana Alvarado Duarte", p1Name: "Luis Felipe Alvarado Santos", p1Email: "felialsa88@gmail.com", p2Name: "Sindy Roxana Duarte Aguilar", p2Email: "cindy2016qwe@gmail.com" },
  { student: "Mya Valentina Amaya Caceres", p1Name: "José Mauricio Amaya Zaldívar", p1Email: "dr.mauricioamayaz@gmail.com", p2Name: "Luz Marina Cáceres", p2Email: "luzma_22@yahoo.es" },
  { student: "Anna Victoria Andino Enriquez", p1Name: "Carlos Orlando Andino López", p1Email: "carlosandinolopez@gmail.com", p2Name: "Daniela Enriquez Moncada", p2Email: "denriquez@mayanschool.edu.hn" },
  { student: "Leah Alizee Avilez Wood", p1Name: "Carlos Samir Avilez Andino", p1Email: "samir.avilez17@gmail.com" },
  { student: "Josue Jared Ayllon Avilez", p1Name: "Gabriela Vanessa Avilez Henríquez", p1Email: "vane.gh0710@gmail.com", p2Name: "Gerardo Josué Ayllon Fonseca", p2Email: "ayllongerardo@gmail.com" },
  { student: "Ronald Javier Aguilera Banegas", p1Name: "Helen Raquel Banegas Zavala", p1Email: "raquelbanegaz@gmail.com" },
  { student: "Matteo Joel Clottes Baquedano", p1Name: "Estefany Rosibel Baquedano Estrada", p1Email: "estefanybe.1623@gmail.com", p2Name: "Joel Alonzo Clottes Oquelí", p2Email: "joelclotter91@gmail.com" },
  { student: "Alessandro Barahona Vasquez", p1Name: "Jesús Alejandro Barahona Izaguirre", p1Email: "jesus.barahona1579@gmail.com" },
  { student: "Mateo Gabriel Soriano Barahona", p1Name: "Sully Nohelia Barahona Laínez", p1Email: "nohe_164@hotmail.com" },
  { student: "Isaac Barrientos Orellana", p1Name: "Isaac Enrique Barrientos Irías", p1Email: "isaacbarrientosirias@gmail.com" },
  { student: "Lucas Emil Barrientos Santamaria", p1Name: "Emil Josué Barrientos Zarzar", p1Email: "emil.zarzar@gmail.com" },
  { student: "Giovanna Lucia Bertrand Fajardo", p1Name: "Wilfredo Humberto Bertrand Nieto", p1Email: "wilfredobertrand@hotmail.com", p2Name: "Roxana Patricia Fajardo Godoy", p2Email: "roxi3101@yahoo.com" },
  { student: "Sebastian Andre Borjas Mejia", p1Name: "Abelardo Enrique Borjas", p1Email: "litoborjas1@yahoo.com" },
  { student: "Fernanda Lisseth Bulnes Coto", p1Name: "Roberto David Bulnes Valle", p1Email: "rdbv87@gmail.com", p2Name: "Emma Lourdes Coto Rivera", p2Email: "emmacoto89@gmail.com" },
  { student: "Hector Daniel Pineda Burgos", p1Name: "Eloísa Jossefina Burgos Rodríguez", p1Email: "eloburgos16@gmail.com" },
  { student: "Kay Bustillo Jimenez", p1Name: "Gerardo Enrique Bustillo Aguilar", p1Email: "gerardo_bustillo2007@hotmail.com" },
  { student: "Genesis Abigail Rodriguez Caballero", p1Name: "Griselda Caballero Gonzales", p1Email: "griseldacaballerogonzalez@gmail.com", p2Name: "Tania Caballero", p2Email: "caballerotania855@gmail.com" },
  { student: "Adriana Sofia Diaz Caceres", p1Name: "Ana Ruth Cáceres Ávila", p1Email: "arca_2525@yahoo.com", p2Name: "David Abrahand Díaz Sánchez", p2Email: "ddisa23@gmail.com" },
  { student: "Daniela Valentina Villanueva Martinez", p1Name: "Esmeralda Calderon", p1Email: "" },
  { student: "Carlos Santiago Calix Escalante", p1Name: "Juan Carlos Cálix Guerrero", p1Email: "jcc.juancarloscalix@gmail.com", p2Name: "Elisa Gabriela Escalante Casco", p2Email: "escalante16g@gmail.com" },
  { student: "Emma Elizabeth Carcamo Molina", p1Name: "Phol Willians Cárcamo Henríquez", p1Email: "phol.carcamo@hotmail.com" },
  { student: "Danna Isabella Casco Cardenas", p1Name: "Mayra Karina Cárdenas Gutiérrez", p1Email: "mkcardenas26@yahoo.es", p2Name: "Geovanny Francisco Casco Martínez", p2Email: "gckcas@yahoo.com" },
  { student: "Joaquin Andres Carias Elvir", p1Name: "Nino Josué Carías Tábora", p1Email: "cariaselvirhn@gmail.com", p2Name: "Isis Andira Elvir Laínez", p2Email: "cariaselvirhn@gmail.com" },
  { student: "Valeria Mari Lopez Castro", p1Name: "Ástrid Suyapa Castro Hernández", p1Email: "astsu18@hotmail.com" },
  { student: "Marcela Valentina Castro Pavon", p1Name: "Allan Wady Castro Parada", p1Email: "allancastro29@gmail.com" },
  { student: "Doris Samantha Castro Pavon", p1Name: "Allan Wady Castro Parada", p1Email: "allancastro29@gmail.com" },
  { student: "Thiago Steve Delgado Cerrato", p1Name: "Alejandra Patricia Cerrato Argeñal", p1Email: "alejandrapatriciacerrato@gmail.com", p2Name: "Richard Steve Delgado Mejía", p2Email: "richard28delgado@gmail.com" },
  { student: "Daniel Edgardo Chacon", p1Name: "Alan Edgardo Chacón", p1Email: "aedchacon@gmail.com" },
  { student: "Josue Daniel Chacon", p1Name: "Alan Edgardo Chacón", p1Email: "aedchacon@gmail.com" },
  { student: "Charlotte Alejandra Cruz Chavez", p1Name: "Karla Sarai Chávez Nolasco", p1Email: "saraichav27@gmail.com", p2Name: "Mario Rolando Cruz Ferguson", p2Email: "blood.ferguson@gmail.com" },
  { student: "Fabian Andres Maradiaga Cruz", p1Name: "Karla Fabiola Cruz Lanza", p1Email: "fabylanza@hotmail.com" },
  { student: "Arianna Isabella Matamoros Cruz", p1Name: "Brenda Yolany Cruz Meraz", p1Email: "Jessymatamoros_1989@hotmail.es" },
  { student: "Luis Carlos Matamoros Cruz", p1Name: "Karen Lizeth Cruz Romero", p1Email: "karencruz12@yahoo.com" },
  { student: "Danna Fidelia Cruz Sanchez", p1Name: "Gustavo Adolfo Cruz", p1Email: "gustavocruzgomez@gmail.com" },
  { student: "EDGAR SEBASTIAN RAMIRES CUBAS", p1Name: "Jessica Patricia Cubas Mejia", p1Email: "jpcubasm@gmail.com" },
  { student: "Eliana Maria Dominguez Martinez", p1Name: "Mario Roberto Domínguez Rodríguez", p1Email: "mariodr3@hotmail.com" },
  { student: "Erika Victoria Elvir Romero", p1Name: "Erick Saúl Elvir gallo", p1Email: "erickelvir@yahoo.es" },
  { student: "Rafael Alfonso Zelaya Erazo", p1Name: "Yohely Banesa Erazo Martínez", p1Email: "yohely.erazo@yahoo.com" },
  { student: "ARIANA MARCELA ESCALANTE ORTIZ", p1Name: "Jose Felix Escalante Mendoza", p1Email: "felixesca84@gmail.com" },
  { student: "Oscar Yuviny Molina Escalon", p1Name: "Alisson Michelle Escalón Murillo", p1Email: "alissonescalon9202@gmail.com" },
  { student: "Deborah Isabella Flores Fonseca", p1Name: "Silex Onan Flores Chandia", p1Email: "silexonanflores@yahoo.es" },
  { student: "Alyssa Natalia Flores Rivera", p1Name: "Daniel Flores Espinoza", p1Email: "dflorespinoza@gmail.com" }
];

export default function RosterManagerModal({ isOpen, onClose }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [emailFilter, setEmailFilter] = useState("ALL");
  const [editingStudent, setEditingStudent] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadRosterData = async () => {
    setLoading(true);
    try {
      if (!db) return;

      const rostersSnap = await getDocs(collection(db, "class_rosters"));
      const rawList = [];

      rostersSnap.forEach((d) => {
        const sec = d.id;
        const list = d.data().students || [];
        list.forEach((s) => {
          rawList.push({
            id: s.id || `${sec}_${(s.displayName || s.rawName || "").toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
            name: s.displayName || s.rawName || s.name || "Unknown Student",
            section: s.section || sec,
            studentEmail: s.studentEmail || "",
            parent1: { ...(s.parent1 || {}) },
            parent2: { ...(s.parent2 || {}) },
            notes: s.notes || "",
            dob: s.dob || "",
            udid: s.udid || "",
            address: s.address || "",
            zearnClasscodeClasswork: s.zearnClasscodeClasswork || (sec === "4B" ? "EZ7D6N" : ""),
            zearnClassworkUser: s.zearnClassworkUser || "",
            zearnClassworkPass: s.zearnClassworkPass || "",
            zearnClasscodeHomework: s.zearnClasscodeHomework || (sec === "4B" ? "DH3P2G" : ""),
            zearnHomeworkUser: s.zearnHomeworkUser || "",
            zearnHomeworkPass: s.zearnHomeworkPass || "",
          });
        });
      });

      const contactsSnap = await getDocs(collection(db, "student_contacts"));
      const contactsMap = {};
      contactsSnap.forEach((d) => {
        contactsMap[d.id] = d.data();
      });

      const merged = rawList.map((stu) => {
        const contact = contactsMap[stu.id];
        if (!contact) return stu;
        return {
          ...stu,
          studentEmail: contact.studentEmail || stu.studentEmail,
          parent1: { ...(stu.parent1 || {}), ...(contact.parent1 || {}) },
          parent2: { ...(stu.parent2 || {}), ...(contact.parent2 || {}) },
          notes: contact.notes || stu.notes,
          dob: contact.dob || stu.dob,
          udid: contact.udid || stu.udid,
          address: contact.address || stu.address,
          zearnClasscodeClasswork: contact.zearnClasscodeClasswork || stu.zearnClasscodeClasswork,
          zearnClassworkUser: contact.zearnClassworkUser || stu.zearnClassworkUser,
          zearnClassworkPass: contact.zearnClassworkPass || stu.zearnClassworkPass,
          zearnClasscodeHomework: contact.zearnClasscodeHomework || stu.zearnClasscodeHomework,
          zearnHomeworkUser: contact.zearnHomeworkUser || stu.zearnHomeworkUser,
          zearnHomeworkPass: contact.zearnHomeworkPass || stu.zearnHomeworkPass,
        };
      });

      merged.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setStudents(merged);
    } catch (err) {
      console.error("[RosterManager] Error loading:", err);
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable */
  useEffect(() => {
    if (isOpen) loadRosterData();
  }, [isOpen]);

  const handleSeedParsedData = async () => {
    if (!window.confirm("Seed the parsed student records into Firestore?")) return;
    setSaving(true);
    let matchedCount = 0;

    for (const entry of SEED_DATA) {
      const match = students.find(s =>
        s.name.toLowerCase().includes(entry.student.toLowerCase()) ||
        entry.student.toLowerCase().includes(s.name.toLowerCase())
      );

      if (match) {
        const payload = {
          parent1: { name: entry.p1Name || "", email: entry.p1Email || "", phone: "" },
          parent2: { name: entry.p2Name || "", email: entry.p2Email || "", phone: "" },
          updatedAt: serverTimestamp()
        };
        try {
          await setDoc(doc(db, "student_contacts", match.id), payload, { merge: true });
          matchedCount++;
        } catch (e) {
          console.error("Failed seeding:", match.name, e);
        }
      }
    }
    alert(`Successfully seeded contact data for ${matchedCount} students!`);
    loadRosterData();
    setSaving(false);
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    if (!editingStudent?.name?.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: editingStudent.name.trim(),
        section: editingStudent.section,
        studentEmail: editingStudent.studentEmail?.trim() || "",
        parent1: {
          name: editingStudent.parent1?.name?.trim() || "",
          email: editingStudent.parent1?.email?.trim() || "",
          phone: editingStudent.parent1?.phone?.trim() || "",
        },
        parent2: {
          name: editingStudent.parent2?.name?.trim() || "",
          email: editingStudent.parent2?.email?.trim() || "",
          phone: editingStudent.parent2?.phone?.trim() || "",
        },
        dob: editingStudent.dob?.trim() || "",
        udid: editingStudent.udid?.trim() || "",
        address: editingStudent.address?.trim() || "",
        zearnClasscodeClasswork: editingStudent.zearnClasscodeClasswork?.trim() || "",
        zearnClassworkUser: editingStudent.zearnClassworkUser?.trim() || "",
        zearnClassworkPass: editingStudent.zearnClassworkPass?.trim() || "",
        zearnClasscodeHomework: editingStudent.zearnClasscodeHomework?.trim() || "",
        zearnHomeworkUser: editingStudent.zearnHomeworkUser?.trim() || "",
        zearnHomeworkPass: editingStudent.zearnHomeworkPass?.trim() || "",
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, "student_contacts", editingStudent.id), payload, { merge: true });
      setStudents((prev) => prev.map((s) => (s.id === editingStudent.id ? { ...s, ...payload } : s)));
      setEditingStudent(null);
    } catch (err) {
      alert("Error saving contact: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const hasEmail = Boolean(s.parent1?.email || s.parent2?.email);
      if (emailFilter === "HAS_EMAIL" && !hasEmail) return false;
      if (emailFilter === "NO_EMAIL" && hasEmail) return false;

      const matchesSec = selectedSection === "All" || s.section === selectedSection;
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.studentEmail?.toLowerCase().includes(q) ||
        s.parent1?.name?.toLowerCase().includes(q) ||
        s.parent1?.email?.toLowerCase().includes(q) ||
        s.parent2?.name?.toLowerCase().includes(q) ||
        s.parent2?.email?.toLowerCase().includes(q);
      return matchesSec && matchesQuery;
    });
  }, [students, selectedSection, searchQuery, emailFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-fg)] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--app-border)] px-6 py-4">
          <div>
            <h2 className="text-xl font-bold">Student Directory & Family Contacts</h2>
            <p className="text-xs text-[var(--app-fg)] opacity-70">
              {students.length} Official Enrolled Students Loaded from Firestore
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSeedParsedData}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition cursor-pointer"
            >
              {saving ? "Seeding..." : "Seed Parsed Data"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-xs font-semibold opacity-80 hover:opacity-100 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--app-border)] bg-[var(--app-surface)]/50 px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {VALID_SECTIONS.map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setSelectedSection(sec)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  selectedSection === sec
                    ? "bg-blue-600 text-white"
                    : "border border-[var(--app-border)] hover:bg-[var(--app-border)]/30"
                }`}
              >
                {sec}
              </button>
            ))}
            <div className="ml-2 pl-3 border-l border-[var(--app-border)] flex items-center">
              <select
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                className="rounded-md border border-[var(--app-border)] bg-transparent px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">All Contacts</option>
                <option value="HAS_EMAIL">Has Email 🟢</option>
                <option value="NO_EMAIL">Missing Email ⭕</option>
              </select>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search by student or parent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Content Body */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="py-20 text-center text-sm opacity-60">
                Loading official rosters from Firebase class_rosters...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-20 text-center text-sm opacity-70">
                No students match this section or filter query.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {filteredStudents.map((s) => {
                  const hasEmailIndicator = Boolean(s.parent1?.email || s.parent2?.email);

                  return (
                    <div
                      key={s.id}
                      className="flex flex-col justify-between rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm hover:border-blue-500 transition"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-sm leading-snug flex items-center gap-2">
                              {s.name}
                              {hasEmailIndicator && (
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-sm" title="Parent Email on File"></span>
                              )}
                            </h3>
                            <span className="inline-block rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400 mt-1">
                              Section {s.section}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingStudent(s)}
                            className="rounded border border-[var(--app-border)] px-2 py-0.5 text-[11px] font-medium hover:bg-blue-600 hover:text-white transition cursor-pointer"
                          >
                            {s.parent1?.name || s.studentEmail ? "Edit Info" : "+ Add Contacts"}
                          </button>
                        </div>

                        {s.studentEmail && (
                          <p className="mt-2 text-xs opacity-80">
                            ✉️ <a href={`mailto:${s.studentEmail}`} className="hover:underline">{s.studentEmail}</a>
                          </p>
                        )}

                        <div className="mt-3 rounded-lg border border-[var(--app-border)]/60 bg-[var(--app-surface)]/60 p-2 text-xs">
                          <div className="font-semibold text-[11px] opacity-70">Primary Contact (Parent 1)</div>
                          {s.parent1?.name ? (
                            <>
                              <div className="font-medium">{s.parent1.name}</div>
                              {s.parent1.email && (
                                <div className="opacity-80 break-all">
                                  <a href={`mailto:${s.parent1.email}`} className="hover:underline text-blue-500">{s.parent1.email}</a>
                                </div>
                              )}
                              {s.parent1.phone && <div className="opacity-80">📞 {s.parent1.phone}</div>}
                            </>
                          ) : (
                            <div className="italic opacity-50">Not on file</div>
                          )}
                        </div>

                        {(s.parent2?.name || s.parent2?.email || s.parent2?.phone) && (
                          <div className="mt-2 rounded-lg border border-[var(--app-border)]/60 bg-[var(--app-surface)]/60 p-2 text-xs">
                            <div className="font-semibold text-[11px] opacity-70">Secondary Contact (Parent 2)</div>
                            <div className="font-medium">{s.parent2.name}</div>
                            {s.parent2.email && (
                              <div className="opacity-80 break-all">
                                <a href={`mailto:${s.parent2.email}`} className="hover:underline text-blue-500">{s.parent2.email}</a>
                              </div>
                            )}
                            {s.parent2.phone && <div className="opacity-80">📞 {s.parent2.phone}</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Edit Drawer (Compartmentalized) */}
          <StudentRosterEditForm
            editingStudent={editingStudent}
            setEditingStudent={setEditingStudent}
            handleSaveContact={handleSaveContact}
            saving={saving}
            onClose={() => setEditingStudent(null)}
          />
        </div>
      </div>
    </div>
  );
}
