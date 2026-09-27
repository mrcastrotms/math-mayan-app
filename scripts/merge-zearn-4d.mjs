import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../src/firebase.js";

const ZEARN_4D_CREDENTIALS = {
  "Charlotte Alejandra Cruz Chavez": { classUser: "CharlotteAlejandra", classPass: "speedyhawk924", hwUser: "CharlotteCruz5", hwPass: "smallsun27" },
  "Diego Alejandro Soto Ruiz": { classUser: "DiegoAlejandro", classPass: "sillysteel954", hwUser: "DiegoSoto2", hwPass: "kindstar36" },
  "Mateo Alessandro Lobo Guardado": { classUser: "MateoAlessandro", classPass: "sillymouse544", hwUser: "MateoLobo", hwPass: "coolbear12" },
  "Sebastian Andre Borjas Mejia": { classUser: "SebastianAndre", classPass: "fastmouse34", hwUser: "SebastianBorjas", hwPass: "happylion64" },
  "Isaac Barrientos Orellana": { classUser: "IsaacBarrientos", classPass: "bluelion444", hwUser: "IsaacBarrientos2", hwPass: "calmfish45" },
  "Josue Daniel Chacon": { classUser: "JosueDaniel", classPass: "lightbear37", hwUser: "JosueChacon", hwPass: "bluehawk91" },
  "Camila Elizabeth Cortes Aguilar": { classUser: "CamilaElizabeth", classPass: "crazysun43", hwUser: "CamilaCortes4", hwPass: "kindmoon6" },
  "Danna Isabella Casco Cardenas": { classUser: "DannaIsabella", classPass: "sillyeagle29", hwUser: "DannaCasco", hwPass: "fastbear34" },
  "Josue Jared Ayllon Avilez": { classUser: "JosueJared", classPass: "lightcat11", hwUser: "JosueAyllon", hwPass: "blueeagle90" },
  "Matteo Joel Clottes Baquedano": { classUser: "MatteoJoel", classPass: "lightsun18", hwUser: "MatteoClottes", hwPass: "kindfish26" },
  "Aaron Jose Saavedra Sjöblom": { classUser: "AaronJose", classPass: "calmparrot33", hwUser: "AaronSaavedra", hwPass: "funparrot26" },
  "Fernanda Lisseth Bulnes Coto": { classUser: "FernandaLisseth", classPass: "lighthawk11", hwUser: "FernandaBulnes", hwPass: "fastmoon48" },
  "Rebeca Matute Hernandez": { classUser: "RebecaMatute", classPass: "bluemoon28", hwUser: "RebecaMatute2", hwPass: "lightfish14" },
  "Emily Roxana Alvarado Duarte": { classUser: "EmilyRoxana", classPass: "happyparrot35", hwUser: "EmilyAlvarado2", hwPass: "lightshark17" },
  "Doris Samantha Castro Pavon": { classUser: "DorisSamantha", classPass: "fastdog43", hwUser: "DorisCastro", hwPass: "zanyparrot43" },
  "Andre Santhiago Padilla Olivera": { classUser: "AndreSanthiago", classPass: "crazymoon21", hwUser: "AndrePadilla", hwPass: "speedybear37" },
  "Linda Sofia Herrera Vasquez": { classUser: "LindaSofia", classPass: "bluelion15", hwUser: "LindaHerrera", hwPass: "fasthorse15" },
  "Thiago Steve Delgado Cerrato": { classUser: "ThiagoSteve", classPass: "sillysun81", hwUser: "ThiagoDelgado8", hwPass: "speedyhorse9" },
  "Leah Valentina Vásquez Leiva": { classUser: "LeahValentina", classPass: "fundog84", hwUser: "LeahVásquez", hwPass: "zanyhawk84" }
};

async function runMigration() {
  console.log("Fetching Section 4D roster from Firestore...");
  const docRef = doc(db, "class_rosters", "4D");
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    console.error("Error: Section 4D roster document not found in Firestore.");
    process.exit(1);
  }

  const data = snapshot.data();
  const existingStudents = data.students || [];
  console.log(`Found ${existingStudents.length} students in Section 4D roster.`);

  let matchCount = 0;
  const updatedStudents = [];

  for (const student of existingStudents) {
    const studentName = (student.displayName || student.rawName || student.name || "").trim();
    const matchKey = Object.keys(ZEARN_4D_CREDENTIALS).find(
      (name) => name.toLowerCase() === studentName.toLowerCase()
    );

    let updatedStudent = { ...student };

    if (matchKey) {
      matchCount++;
      const creds = ZEARN_4D_CREDENTIALS[matchKey];
      updatedStudent = {
        ...student,
        zearnClasscodeClasswork: "TN9P2J",
        zearnClassworkUser: creds.classUser,
        zearnClassworkPass: creds.classPass,
        zearnClasscodeHomework: "CW9E4M",
        zearnHomeworkUser: creds.hwUser,
        zearnHomeworkPass: creds.hwPass,
      };

      const studentId = student.id || `4D_${studentName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      const contactRef = doc(db, "student_contacts", studentId);
      await setDoc(
        contactRef,
        {
          name: studentName,
          section: "4D",
          zearnClasscodeClasswork: "TN9P2J",
          zearnClassworkUser: creds.classUser,
          zearnClassworkPass: creds.classPass,
          zearnClasscodeHomework: "CW9E4M",
          zearnHomeworkUser: creds.hwUser,
          zearnHomeworkPass: creds.hwPass,
        },
        { merge: true }
      );
    }
    updatedStudents.push(updatedStudent);
  }

  await setDoc(docRef, { ...data, students: updatedStudents }, { merge: true });
  console.log(`Successfully synced Zearn credentials for ${matchCount} students in class_rosters and student_contacts for Section 4D.`);
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
