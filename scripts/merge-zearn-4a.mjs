import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../src/firebase.js";

const ZEARN_4A_CREDENTIALS = {
  "Genesis Abigail Rodriguez Caballero": { classUser: "GenesisAbigailcoolstar13", classPass: "coolstar13", hwUser: "GenesisRodriguez17fastdog16", hwPass: "fastdog16" },
  "Santiago Adrian Romero Mejia": { classUser: "SantiagoAdrianRomeroMejiacalmshark27", classPass: "calmshark27", hwUser: "SantiagoRomero6sillystar11", hwPass: "sillystar11" },
  "Santiago Andre Cortes Mejia": { classUser: "SantiagoAndreCortesMejiafaststar8", classPass: "faststar8", hwUser: "SantiagoCortes5bluebear17", hwPass: "bluebear17" },
  "Joaquin Andres Carias Elvir": { classUser: "JoaquinAndresCariasElvirbluesun39", classPass: "bluesun39", hwUser: "JoaquinCariascrazylion39", hwPass: "crazylion39" },
  "Alessandro Barahona Vasquez": { classUser: "AlessandroBarahonaVasquezbluefish39", classPass: "bluefish39", hwUser: "AlessandroBarahonafunshark36", hwPass: "funshark36" },
  "Joaquin Daniel Reyes Matamoros": { classUser: "JoaquinDanielReyesMatamorosredbear11", classPass: "redbear11", hwUser: "JoaquinReyes4calmfish54", hwPass: "calmfish54" },
  "Daniel Edgardo Chacon": { classUser: "DanielEdgardoChaconcooldog38", classPass: "cooldog38", hwUser: "DanielChacon2funlion99", hwPass: "funlion99" },
  "Emma Elizabeth Carcamo Molina": { classUser: "EmmaElizabethCarcamoMolinacalmhorse17", classPass: "calmhorse17", hwUser: "EmmaCarcamocalmshark5", hwPass: "calmshark5" },
  "Maria Isabella Aplicano Sanchez": { classUser: "MariaIsabellaAplicanoSanchezreddog65", classPass: "reddog65", hwUser: "MariaAplicanocrazyfish68", hwPass: "crazyfish68" },
  "Dominic Jeampierre Padilla Fonseca": { classUser: "DominicJeampierrePadillaFonsecakindwolf4", classPass: "kindwolf4", hwUser: "DominicPadilla13sillywolf45", hwPass: "sillywolf45" },
  "Michael Joan Herrera Mendoza": { classUser: "MichaelJoanHerreraMendozalightmouse54", classPass: "lightmouse54", hwUser: "MichaelHerrera13coolstar46", hwPass: "coolstar46" },
  "Max Joseph Sabillon Aguilar": { classUser: "MaxJosephSabillonAguilarbluehawk43", classPass: "bluehawk43", hwUser: "MaxSabillonsillysun71", hwPass: "sillysun71" },
  "Valeria Mari Lopez Castro": { classUser: "ValeriaMariLopezCastrocoolshark100", classPass: "coolshark100", hwUser: "ValeriaLopezhappyhorse54", hwPass: "happyhorse54" },
  "Gianna Maria Quintero Ordóñez": { classUser: "GiannaMariahappystar97", classPass: "happystar97", hwUser: "GiannaQuintero2happylion34", hwPass: "happylion34" },
  "Thiago Meslier Vasquez Puerto": { classUser: "ThiagoMeslierVasquezPuertocrazystar42", classPass: "crazystar42", hwUser: "ThiagoVasquez2fastbear23", hwPass: "fastbear23" },
  "Alyssa Natalia Flores Rivera": { classUser: "AlyssaNataliaFloresRiveraredwolf29", classPass: "redwolf29", hwUser: "AlyssaFlores2fastshark99", hwPass: "fastshark99" },
  "Ambar Rafaela Medina Perdomo": { classUser: "AmbarRafaelaMedinaPerdomocrazysteel71", classPass: "crazysteel71", hwUser: "AmbarMedina2kindwhale78", hwPass: "kindwhale78" },
  "Hayden Sebastian Gonzalez Osorto": { classUser: "HaydenSebastianGonzalezOsortocalmcat50", classPass: "calmcat50", hwUser: "HaydenGonzalez3calmwolf36", hwPass: "calmwolf36" },
  "Adriana Sofia Diaz Caceres": { classUser: "AdrianaSofiaDiazCaceresfunsteel47", classPass: "funsteel47", hwUser: "AdrianaDiaz5zanycat72", hwPass: "zanycat72" },
  "Daniela Valentina Ayala Lopez": { classUser: "DanielaValentinaAyalaLopezfasttiger25", classPass: "fasttiger25", hwUser: "DanielaAyalakindhorse38", hwPass: "kindhorse38" },
  "Marcela Valentina Castro Pavon": { classUser: "MarcelaValentinaCastroPavonredstar41", classPass: "redstar41", hwUser: "MarcelaCastrospeedyshark26", hwPass: "speedyshark26" }
};

async function runMigration() {
  console.log("Fetching Section 4A roster from Firestore...");
  const docRef = doc(db, "class_rosters", "4A");
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    console.error("Error: Section 4A roster document not found in Firestore.");
    process.exit(1);
  }

  const data = snapshot.data();
  const existingStudents = data.students || [];
  console.log(`Found ${existingStudents.length} students in Section 4A roster.`);

  let matchCount = 0;
  const updatedStudents = [];

  for (const student of existingStudents) {
    const studentName = (student.displayName || student.rawName || student.name || "").trim();
    const matchKey = Object.keys(ZEARN_4A_CREDENTIALS).find(
      (name) => name.toLowerCase() === studentName.toLowerCase()
    );

    let updatedStudent = { ...student };

    if (matchKey) {
      matchCount++;
      const creds = ZEARN_4A_CREDENTIALS[matchKey];
      updatedStudent = {
        ...student,
        zearnClasscodeClasswork: "MY9Q4Y",
        zearnClassworkUser: creds.classUser,
        zearnClassworkPass: creds.classPass,
        zearnClasscodeHomework: "XX9U9V",
        zearnHomeworkUser: creds.hwUser,
        zearnHomeworkPass: creds.hwPass,
      };

      const studentId = student.id || `4A_${studentName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      const contactRef = doc(db, "student_contacts", studentId);
      await setDoc(
        contactRef,
        {
          name: studentName,
          section: "4A",
          zearnClasscodeClasswork: "MY9Q4Y",
          zearnClassworkUser: creds.classUser,
          zearnClassworkPass: creds.classPass,
          zearnClasscodeHomework: "XX9U9V",
          zearnHomeworkUser: creds.hwUser,
          zearnHomeworkPass: creds.hwPass,
        },
        { merge: true }
      );
    }
    updatedStudents.push(updatedStudent);
  }

  await setDoc(docRef, { ...data, students: updatedStudents }, { merge: true });
  console.log(`Successfully synced Zearn credentials for ${matchCount} students in class_rosters and student_contacts for Section 4A.`);
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
