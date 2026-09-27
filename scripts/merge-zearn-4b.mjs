import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../src/firebase.js";

const ZEARN_4B_CREDENTIALS = {
  "Kiara Alejandra Soto Ruiz": { classUser: "KiaraAlejandraSotoRuiz", classPass: "coolsun75", hwUser: "KiaraSoto", hwPass: "cooldog30" },
  "Leah Alizee Avilez Wood": { classUser: "LeahAlizeeAvilezWood", classPass: "funsun91", hwUser: "LeahAvilez", hwPass: "sillybear23" },
  "Roger Andre Galindo Zepeda": { classUser: "RogerAndreGalindoZepeda", classPass: "speedyeagle74", hwUser: "RogerGalindo", hwPass: "fastmoon13" },
  "Fabian Andres Maradiaga Cruz": { classUser: "FabianAndresMaradiagaCruz", classPass: "smallwolf46", hwUser: "FabianMaradiaga", hwPass: "crazymouse39" },
  "Kay Bustillo Jimenez": { classUser: "KayBustilloJimenez", classPass: "sillybear83", hwUser: "KayBustillo", hwPass: "reddog11" },
  "Luis Carlos Matamoros Cruz": { classUser: "LuisCarlosMatamorosCruz", classPass: "lightlion93", hwUser: "LuisMatamoros", hwPass: "calmmoon88" },
  "Mr. Castro": { classUser: "Mr.Castro2", classPass: "lightsteel71", hwUser: "", hwPass: "" },
  "Hector Daniel Pineda Burgos": { classUser: "HectorDanielPinedaBurgos", classPass: "speedyparrot23", hwUser: "HectorPineda", hwPass: "kindeagle79" },
  "Jose David Lopez Gonzales": { classUser: "JoseDavidLopezGonzales", classPass: "happyfish62", hwUser: "JoseLopez53", hwPass: "speedytiger65" },
  "Lucas Emil Barrientos Santamaria": { classUser: "LucasEmilBarrientosSantamaria", classPass: "lightdog79", hwUser: "LucasBarrientos", hwPass: "coollion86" },
  "Arianna Isabella Matamoros Cruz": { classUser: "AriannaIsabellaMatamorosCruz", classPass: "lighthorse70", hwUser: "AriannaMatamoros", hwPass: "happystar93" },
  "Ronald Javier Aguilera Banegas": { classUser: "RonaldJavierAguileraBanegas", classPass: "sillyhorse2", hwUser: "RonaldAguilera", hwPass: "smallhorse64" },
  "Antony Jose Maradiaga Parson": { classUser: "AntonyJoseMaradiagaParson", classPass: "zanybear36", hwUser: "AntonyMaradiaga", hwPass: "speedybear35" },
  "Tzadik Josué Ruiz Martínez": { classUser: "TzadikRuiz", classPass: "crazyshark29", hwUser: "TzadikRuiz2", hwPass: "sillyfish51" },
  "Giovanna Lucia Bertrand Fajardo": { classUser: "GiovannaLucia", classPass: "redtiger55", hwUser: "GiovannaBertrand", hwPass: "calmshark47" },
  "Dulce Renata Navas Romero": { classUser: "DulceRenataNavasRomero", classPass: "lightwhale51", hwUser: "DulceNavas2", hwPass: "smallfish99" },
  "Carlos Santiago Calix Escalante": { classUser: "CarlosSantiagoCalixEscalante", classPass: "coolfish74", hwUser: "CarlosCalix", hwPass: "calmdog25" },
  "Edgar Sebastian Ramires Cubas": { classUser: "EDGARSEBASTIANRAMIRESCUBAS", classPass: "redsun42", hwUser: "EdgarRamires", hwPass: "bluedog30" },
  "Daniela Valentina Villanueva Martinez": { classUser: "DanielaValentinazanylion23", classPass: "zanylion23", hwUser: "DanielaVillanueva", hwPass: "speedycat94" },
  "Alia Valeria Rodriguez Reyes": { classUser: "AliaValeriaRodriguezReyes", classPass: "kindstar16", hwUser: "AliaRodriguez2", hwPass: "speedysteel50" },
  "Anna Victoria Andino Enriquez": { classUser: "AnnaVictoriaAndinoEnriquez", classPass: "speedywhale73", hwUser: "AnnaAndino", hwPass: "crazysun91" }
};

async function runMigration() {
  console.log("Fetching Section 4B roster from Firestore...");
  const docRef = doc(db, "class_rosters", "4B");
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    console.error("Error: Section 4B roster document not found in Firestore.");
    process.exit(1);
  }

  const data = snapshot.data();
  const existingStudents = data.students || [];
  console.log(`Found ${existingStudents.length} students in Section 4B roster.`);

  let matchCount = 0;
  const updatedStudents = existingStudents.map((student) => {
    const studentName = (student.displayName || student.rawName || "").trim();
    const matchKey = Object.keys(ZEARN_4B_CREDENTIALS).find(
      (name) => name.toLowerCase() === studentName.toLowerCase()
    );

    if (matchKey) {
      matchCount++;
      const creds = ZEARN_4B_CREDENTIALS[matchKey];
      return {
        ...student,
        zearnClasscodeClasswork: "EZ7D6N",
        zearnClassworkUser: creds.classUser,
        zearnClassworkPass: creds.classPass,
        zearnClasscodeHomework: "DH3P2G",
        zearnHomeworkUser: creds.hwUser,
        zearnHomeworkPass: creds.hwPass,
      };
    }
    return student;
  });

  console.log(`Successfully matched and merged Zearn credentials for ${matchCount} students.`);

  await setDoc(docRef, { ...data, students: updatedStudents }, { merge: true });
  console.log("Firestore document class_rosters/4B updated successfully without data loss.");
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
