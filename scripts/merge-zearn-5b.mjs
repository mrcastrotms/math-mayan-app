import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../src/firebase.js";

const ZEARN_5B_CREDENTIALS = {
  // Classwork 5B (DW9W4J)
  "Mahia Alvarado": { classUser: "MahiaAlvarado", classPass: "happyparrot30", hwUser: "MahiaMarcía", hwPass: "zanywolf20" },
  "Natalia Antunez": { classUser: "NataliaAntunez2", classPass: "calmhorse81", hwUser: "NataliaNavas", hwPass: "sillymoon97" },
  "Mr. Castro": { classUser: "Mr.Castro", classPass: "redwhale67", hwUser: "", hwPass: "" },
  "Gabriel Espinal": { classUser: "GabrielEspinal", classPass: "coolhawk71", hwUser: "MarceloEspinal", hwPass: "happysteel71" },
  "Ariana Fonseca": { classUser: "ArianaFonseca", classPass: "speedysteel31", hwUser: "ArianaAndrade", hwPass: "crazywhale44" },
  "Neil Garcia": { classUser: "NeilGarcia", classPass: "lightmouse63", hwUser: "NeilHill", hwPass: "crazytiger88" },
  "Alessandra Lozano": { classUser: "AlessandraLozano", classPass: "smallparrot5", hwUser: "AlessandraGomez", hwPass: "fastmouse52" },
  "Cristopher Manzano": { classUser: "CristopherManzano", classPass: "speedyparrot9", hwUser: "CristopherMorazán", hwPass: "funlion56" },
  "Mariana Matute": { classUser: "MarianaMatute", classPass: "crazyeagle34", hwUser: "MarianaRecarte", hwPass: "fastcat53" },
  "Angel Molina": { classUser: "AngelMolina10", classPass: "fastmoon19", hwUser: "AngelTorres", hwPass: "kindhorse83" },
  "Elias Osorio": { classUser: "EliasOsorio2", classPass: "fastparrot39", hwUser: "EliasZelaya", hwPass: "redmouse13" },
  "Kamilah Padilla": { classUser: "KamilahPadilla", classPass: "funsun53", hwUser: "KamilahDickerman", hwPass: "kindsun45" },
  "Natalia Peralta": { classUser: "NataliaPeralta2", classPass: "funwhale97", hwUser: "NataliaVelásquez", hwPass: "happywhale6" },
  "Ian Pineda": { classUser: "IanPineda4", classPass: "speedyeagle7", hwUser: "IanBaquedano", hwPass: "happyfish10" },
  "Josue Ramirez": { classUser: "JosueRamirez25", classPass: "coolmouse17", hwUser: "JosueMartinez", hwPass: "coolbear71" },
  "Marcelo Ramirez": { classUser: "MarceloRamirez3", classPass: "crazyhorse88", hwUser: "MateoTinoco", hwPass: "happyhorse22" },
  "Mateo Rubio": { classUser: "MateoRubio2", classPass: "fastwolf93", hwUser: "OscarRomero", hwPass: "zanyparrot79" },
  "Ivanna Silva": { classUser: "IvannaSilva", classPass: "crazyhorse94", hwUser: "IvannaFlores", hwPass: "kindmoon74" },
  "Sofie Torres": { classUser: "SofieTorres", classPass: "funwhale95", hwUser: "SofieCalderon", hwPass: "smallshark1" },
  "Jimena Valeriano": { classUser: "JimenaValeriano", classPass: "crazywolf8", hwUser: "JimenaHerrera", hwPass: "fastwolf43" },
  "Oscar Velasquez": { classUser: "OscarVelasquez3", classPass: "speedyeagle23", hwUser: "GabrielLocandro", hwPass: "kindmoon95" },
  "Valeria Villatoro": { classUser: "ValeriaVillatoro", classPass: "coolwolf71", hwUser: "ValeriaDelgado", hwPass: "redfish40" }
};

async function runMigration() {
  console.log("Fetching Section 5B roster from Firestore...");
  const docRef = doc(db, "class_rosters", "5B");
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    console.error("Error: Section 5B roster document not found in Firestore.");
    process.exit(1);
  }

  const data = snapshot.data();
  const existingStudents = data.students || [];
  console.log(`Found ${existingStudents.length} students in Section 5B roster.`);

  let matchCount = 0;
  const updatedStudents = [];

  for (const student of existingStudents) {
    const studentName = (student.displayName || student.rawName || student.name || "").trim();
    const matchKey = Object.keys(ZEARN_5B_CREDENTIALS).find(
      (name) => name.toLowerCase() === studentName.toLowerCase() || studentName.toLowerCase().includes(name.toLowerCase())
    );

    let updatedStudent = { ...student };

    if (matchKey) {
      matchCount++;
      const creds = ZEARN_5B_CREDENTIALS[matchKey];
      updatedStudent = {
        ...student,
        zearnClasscodeClasswork: "DW9W4J",
        zearnClassworkUser: creds.classUser,
        zearnClassworkPass: creds.classPass,
        zearnClasscodeHomework: "RQ7G2G",
        zearnHomeworkUser: creds.hwUser,
        zearnHomeworkPass: creds.hwPass,
      };

      const studentId = student.id || `5B_${studentName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      const contactRef = doc(db, "student_contacts", studentId);
      await setDoc(
        contactRef,
        {
          name: studentName,
          section: "5B",
          zearnClasscodeClasswork: "DW9W4J",
          zearnClassworkUser: creds.classUser,
          zearnClassworkPass: creds.classPass,
          zearnClasscodeHomework: "RQ7G2G",
          zearnHomeworkUser: creds.hwUser,
          zearnHomeworkPass: creds.hwPass,
        },
        { merge: true }
      );
    }
    updatedStudents.push(updatedStudent);
  }

  await setDoc(docRef, { ...data, students: updatedStudents }, { merge: true });
  console.log(`Successfully synced Zearn credentials for ${matchCount} students in class_rosters and student_contacts for Section 5B.`);
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
