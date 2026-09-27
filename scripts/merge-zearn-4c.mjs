import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../src/firebase.js";

const ZEARN_4C_CREDENTIALS = {
  "Karla Sofia Aguilar Elvir": { classUser: "KarlaAguilar", classPass: "calmwolf3", hwUser: "KarlaAguilar2", hwPass: "calmparrot93" },
  "Abdiel Isaac Alba Martinez": { classUser: "AbdielAlba", classPass: "speedyeagle53", hwUser: "AbdielAlba2", hwPass: "lightbear26" },
  "Danna Fidelia Cruz Sanchez": { classUser: "DannaCruz", classPass: "lightfish65", hwUser: "DannaCruz5coolhawk5", hwPass: "coolhawk5" },
  "Erika Victoria Elvir Romero": { classUser: "ErikaElvir", classPass: "calmdog84", hwUser: "ErikaElvir2", hwPass: "speedymouse29" },
  "Ariana Marcela Escalante Ortiz": { classUser: "ArianaEscalante", classPass: "funshark67", hwUser: "ArianaEscalante2", hwPass: "bluewhale29" },
  "Deborah Isabella Flores Fonseca": { classUser: "", classPass: "", hwUser: "DeborahFlores2", hwPass: "redwolf82" },
  "Adriana Odette Fuentes Valladares": { classUser: "AdrianaFuentes2", classPass: "crazymouse18", hwUser: "AdrianaFuentes4", hwPass: "lightwolf7" },
  "Jose Carlos Maldonado Pacheco": { classUser: "JoseMaldonado", classPass: "3sillyshark2", hwUser: "JoseMaldonado6", hwPass: "happycat83" },
  "Daniela Abigail Medina Flores": { classUser: "DanielaMedina", classPass: "4coolfish49", hwUser: "DanielaMedina3", hwPass: "calmstar61" },
  "Oscar Yuviny Molina Escalon": { classUser: "OscarMolina2", classPass: "speedystar40", hwUser: "OscarMolina5", hwPass: "funhorse15" },
  "Julian Andres Ordoñez Salvador": { classUser: "JulianOrdo", classPass: "kindparrot77", hwUser: "JulianOr2", hwPass: "speedyhawk14" },
  "David Alessandro Reyes Aguilera": { classUser: "DavidReyes10", classPass: "calmdog54", hwUser: "DavidReyes7", hwPass: "calmshark42" },
  "Dylan Asahel Rodriguez Mendes": { classUser: "DylanRodriguez20", classPass: "crazylion38", hwUser: "DylanRodriguez8", hwPass: "redparrot73" },
  "Bruno Isaac Rodríguez Zelaya": { classUser: "BrunoRodri", classPass: "smallfish90", hwUser: "BrunoRod", hwPass: "speedylion22" },
  "Mateo Gabriel Soriano Barahona": { classUser: "MateoSoriano", classPass: "funmouse81", hwUser: "MateoSoriano2", hwPass: "redhorse66" },
  "Rebecca Sorto Rivera": { classUser: "RebeccaSorto", classPass: "coolmoon30", hwUser: "RebeccaSorto2", hwPass: "calmwolf41" },
  "Sofía Nicole Torres Montero": { classUser: "SofiTorres", classPass: "fasthorse21", hwUser: "SofíaTorres", hwPass: "funcat65" },
  "Arles Santiago Toscano Amador": { classUser: "ArlesToscano", classPass: "bluesun95", hwUser: "ArlesToscano2", hwPass: "coolmoon66" },
  "Ariana Lily Zavala Alvarado": { classUser: "ArianaZavala", classPass: "funsun22", hwUser: "ArianaZavala2", hwPass: "sillymoon33" },
  "Ben Tennyson": { classUser: "BenTennyson", classPass: "08010801", hwUser: "", hwPass: "" }
};

async function runMigration() {
  console.log("Fetching Section 4C roster from Firestore...");
  const docRef = doc(db, "class_rosters", "4C");
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    console.error("Error: Section 4C roster document not found in Firestore.");
    process.exit(1);
  }

  const data = snapshot.data();
  const existingStudents = data.students || [];
  console.log(`Found ${existingStudents.length} students in Section 4C roster.`);

  let matchCount = 0;
  const updatedStudents = [];

  for (const student of existingStudents) {
    const studentName = (student.displayName || student.rawName || student.name || "").trim();
    const matchKey = Object.keys(ZEARN_4C_CREDENTIALS).find(
      (name) => name.toLowerCase() === studentName.toLowerCase()
    );

    let updatedStudent = { ...student };

    if (matchKey) {
      matchCount++;
      const creds = ZEARN_4C_CREDENTIALS[matchKey];
      updatedStudent = {
        ...student,
        zearnClasscodeClasswork: "TZ8V3Q",
        zearnClassworkUser: creds.classUser,
        zearnClassworkPass: creds.classPass,
        zearnClasscodeHomework: "JT6V2D",
        zearnHomeworkUser: creds.hwUser,
        zearnHomeworkPass: creds.hwPass,
      };

      const studentId = student.id || `4C_${studentName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      const contactRef = doc(db, "student_contacts", studentId);
      await setDoc(
        contactRef,
        {
          name: studentName,
          section: "4C",
          zearnClasscodeClasswork: "TZ8V3Q",
          zearnClassworkUser: creds.classUser,
          zearnClassworkPass: creds.classPass,
          zearnClasscodeHomework: "JT6V2D",
          zearnHomeworkUser: creds.hwUser,
          zearnHomeworkPass: creds.hwPass,
        },
        { merge: true }
      );
    }
    updatedStudents.push(updatedStudent);
  }

  await setDoc(docRef, { ...data, students: updatedStudents }, { merge: true });
  console.log(`Successfully synced Zearn credentials for ${matchCount} students in class_rosters and student_contacts for Section 4C.`);
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
