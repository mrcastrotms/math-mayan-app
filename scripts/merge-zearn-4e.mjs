import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../src/firebase.js";

const ZEARN_4E_CREDENTIALS = {
  "Adriana Lucia Almendarez Salgado": { classUser: "AdrianaAlmendarez", classPass: "speedysteel27", hwUser: "AdrianaAlmendarez2", hwPass: "speedybear52" },
  "Mya Valentina Amaya Caceres": { classUser: "MyaAmaya", classPass: "fastfish39", hwUser: "MyaAmaya2", hwPass: "smallwolf60" },
  "Sofia Cruz": { classUser: "SofiaCruz6", classPass: "fastparrot83", hwUser: "SofiaCruz14", hwPass: "lightparrot90" },
  "Eliana Maria Dominguez Martinez": { classUser: "ElianaDominguez", classPass: "redfish21", hwUser: "ElianaDom", hwPass: "smallhorse22" },
  "Ivan Garcia": { classUser: "IvanGarcia3", classPass: "sillycat27", hwUser: "IvanGarcia19", hwPass: "coolwolf83" },
  "Zahara Gutierrez": { classUser: "ZaharaGutierrez", classPass: "fastfish64", hwUser: "ZaharaGutierrez2", hwPass: "kindbear91" },
  "Ethan Hernandez": { classUser: "EthanHernandez7", classPass: "funlion34", hwUser: "EthanHernandez54", hwPass: "blueshark31" },
  "Luis Jimenez": { classUser: "LuisJimenez14", classPass: "smalldog30", hwUser: "LuisJimenez6", hwPass: "sillymouse22" },
  "Giovanna Moncada": { classUser: "GiovannaMoncada", classPass: "speedywolf97", hwUser: "GiovannaMoncada2", hwPass: "bluetiger39" },
  "Thiago Moncada": { classUser: "ThiagoMoncada", classPass: "happywhale100", hwUser: "ThiagoMoncada2", hwPass: "lightstar90" },
  "Adriana Ortez": { classUser: "AdrianaOrtez", classPass: "smallmoon92", hwUser: "AdrianaOrtez2", hwPass: "redmoon95" },
  "Ariana Perez": { classUser: "ArianaPerez7", classPass: "lighthawk51", hwUser: "ArianaPerez20", hwPass: "redeagle34" },
  "Ian Ramirez": { classUser: "IanRamirez10", classPass: "funlion97", hwUser: "IanRamirez23", hwPass: "calmfish85" },
  "Edward Rodriguez": { classUser: "EdwardRodriguez13", classPass: "funtiger18", hwUser: "EdwardRodriguez23", hwPass: "redwhale5" },
  "Matias Rodriguez Aguilar": { classUser: "MatiasRodriguez12", classPass: "happyhorse36", hwUser: "MatiasRodriguez4", hwPass: "smalltiger39" },
  "Enrique Sorto": { classUser: "EnriqueSorto", classPass: "calmstar97", hwUser: "EnriqueSorto2", hwPass: "funshark93" },
  "Cristian Daniel Sosa Aleman": { classUser: "CristianSosa2", classPass: "happystar64", hwUser: "CristianSosa4", hwPass: "redfish44" },
  "Rafael Alfonso Zelaya Erazo": { classUser: "RafaelZelaya", classPass: "calmparrot47", hwUser: "RafaelZelaya2", hwPass: "smallcat38" },
  "Dylan Zuniga": { classUser: "DylanZuniga11", classPass: "bluestar78", hwUser: "DylanZuniga5", hwPass: "calmmoon11" }
};

async function runMigration() {
  console.log("Fetching Section 4E roster from Firestore...");
  const docRef = doc(db, "class_rosters", "4E");
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    console.error("Error: Section 4E roster document not found in Firestore.");
    process.exit(1);
  }

  const data = snapshot.data();
  const existingStudents = data.students || [];
  console.log(`Found ${existingStudents.length} students in Section 4E roster.`);

  let matchCount = 0;
  const updatedStudents = [];

  for (const student of existingStudents) {
    const studentName = (student.displayName || student.rawName || student.name || "").trim();
    const matchKey = Object.keys(ZEARN_4E_CREDENTIALS).find(
      (name) => name.toLowerCase() === studentName.toLowerCase() || studentName.toLowerCase().includes(name.toLowerCase())
    );

    let updatedStudent = { ...student };

    if (matchKey) {
      matchCount++;
      const creds = ZEARN_4E_CREDENTIALS[matchKey];
      updatedStudent = {
        ...student,
        zearnClasscodeClasswork: "V58Z4X",
        zearnClassworkUser: creds.classUser,
        zearnClassworkPass: creds.classPass,
        zearnClasscodeHomework: "WY4Q8U",
        zearnHomeworkUser: creds.hwUser,
        zearnHomeworkPass: creds.hwPass,
      };

      const studentId = student.id || `4E_${studentName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      const contactRef = doc(db, "student_contacts", studentId);
      await setDoc(
        contactRef,
        {
          name: studentName,
          section: "4E",
          zearnClasscodeClasswork: "V58Z4X",
          zearnClassworkUser: creds.classUser,
          zearnClassworkPass: creds.classPass,
          zearnClasscodeHomework: "WY4Q8U",
          zearnHomeworkUser: creds.hwUser,
          zearnHomeworkPass: creds.hwPass,
        },
        { merge: true }
      );
    }
    updatedStudents.push(updatedStudent);
  }

  await setDoc(docRef, { ...data, students: updatedStudents }, { merge: true });
  console.log(`Successfully synced Zearn credentials for ${matchCount} students in class_rosters and student_contacts for Section 4E.`);
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
