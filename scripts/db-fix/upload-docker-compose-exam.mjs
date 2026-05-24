import { MongoClient, ObjectId } from "mongodb";
import dns from "node:dns";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!process.env.MONGO_URI) {
    const envPath = resolve(__dirname, "../../Server/.env");
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
        const m = line.match(/^\s*MONGO_URI\s*=\s*(.+?)\s*$/);
        if (m) {
            process.env.MONGO_URI = m[1];
            break;
        }
    }
}

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI not set");

const DRY_RUN = process.argv.includes("--dry-run");
const PUBLISH = process.argv.includes("--publish");

const exam = {
    type: "local",
    title: "Docker Compose Fundamentals",
    description:
        "Five multiple-choice questions covering Docker Compose motivation, compose.yaml semantics, env_file vs environment, env file precedence, and appropriate use cases.",
    questions: [
        {
            id: "q_compose_motivation",
            type: "single_choice",
            prompt:
                "What is the primary motivation for using Docker Compose to manage a multi-container application instead of using individual `docker run` commands?",
            points: 20,
            options: [
                {
                    id: "opt_q1_a",
                    label:
                        "Docker Compose ships a graphical user interface that lets operators visually start, stop, inspect, and manage running containers across hosts without a CLI.",
                    isCorrect: false,
                },
                {
                    id: "opt_q1_b",
                    label:
                        "Docker Compose builds images significantly faster than the plain `docker build` command because it parallelizes layer construction across all services in the file.",
                    isCorrect: false,
                },
                {
                    id: "opt_q1_c",
                    label:
                        "Containers started by Docker Compose consume noticeably fewer CPU and memory resources than equivalent containers launched directly with the `docker run` command.",
                    isCorrect: false,
                },
                {
                    id: "opt_q1_d",
                    label:
                        "Docker Compose declares an entire multi-service stack — containers, networks, volumes, configuration — in one compose.yaml file for reproducible, version-controlled startup.",
                    isCorrect: true,
                },
                {
                    id: "opt_q1_e",
                    label:
                        "Docker Compose is the only supported mechanism for creating user-defined networks and named volumes that multiple containers on the same host can share.",
                    isCorrect: false,
                },
            ],
        },
        {
            id: "q_compose_up_ports",
            type: "single_choice",
            prompt:
                'Consider the following compose.yaml file:\n\nservices:\n  web:\n    image: nginx:1.27.0\n    ports:\n      - "8080:80"\n\nAfter running `docker compose up`, what is the expected outcome?',
            points: 20,
            options: [
                {
                    id: "opt_q2_a",
                    label:
                        "A container from the nginx:1.27.0 image starts and traffic hitting port 8080 on the host machine is forwarded into port 80 inside that running container.",
                    isCorrect: true,
                },
                {
                    id: "opt_q2_b",
                    label:
                        "A container starts from the nginx image, and traffic hitting port 80 on the host machine is forwarded into port 8080 inside the running container instead.",
                    isCorrect: false,
                },
                {
                    id: "opt_q2_c",
                    label:
                        "The command fails immediately because no `networks:` block has been defined for the web service, and Compose refuses to start services without an explicit network.",
                    isCorrect: false,
                },
                {
                    id: "opt_q2_d",
                    label:
                        "An image tagged `web` is built using a local Dockerfile in the project directory, but no container is actually started until the user runs a separate command.",
                    isCorrect: false,
                },
                {
                    id: "opt_q2_e",
                    label:
                        "The nginx image is pulled from Docker Hub into the local image cache, but no container is started — the user must run `docker compose start` as a separate step.",
                    isCorrect: false,
                },
            ],
        },
        {
            id: "q_env_file_vs_environment",
            type: "single_choice",
            prompt:
                "Why is it a better and more secure practice to manage sensitive information, like database passwords, using the `env_file` property in a compose.yaml file, rather than the `environment` property?",
            points: 20,
            options: [
                {
                    id: "opt_q3_a",
                    label:
                        "The `environment` property has been formally deprecated by Docker and will be removed entirely in upcoming versions of Docker Compose, so all teams must migrate now.",
                    isCorrect: false,
                },
                {
                    id: "opt_q3_b",
                    label:
                        "The `env_file` directive automatically encrypts variables on disk and in transit, whereas the `environment` property stores all of its values as readable plain text.",
                    isCorrect: false,
                },
                {
                    id: "opt_q3_c",
                    label:
                        "The `environment` property cannot handle special characters such as `$`, `!`, or `#`, which makes it unsuitable for storing complex passwords containing those symbols.",
                    isCorrect: false,
                },
                {
                    id: "opt_q3_d",
                    label:
                        "Using `env_file` is significantly faster because Docker Compose can read a flat key=value file much more quickly than it can parse the structured YAML environment block.",
                    isCorrect: false,
                },
                {
                    id: "opt_q3_e",
                    label:
                        "`env_file` points to an external file (such as `.env`) that can be excluded from version control via `.gitignore`, so secrets are never hardcoded into compose.yaml or committed.",
                    isCorrect: true,
                },
            ],
        },
        {
            id: "q_env_file_precedence",
            type: "single_choice",
            prompt:
                "A developer defines two environment files, common.env and prod.env, and uses them in a compose.yaml as follows:\n\n# common.env\nLOG_LEVEL=info\nDB_HOST=database\n\n# prod.env\nLOG_LEVEL=warn\nAPI_KEY=xyz-prod-key\n\n# compose.yaml\nservices:\n  api:\n    image: my-api\n    env_file:\n      - common.env\n      - prod.env\n\nWhat will be the effective value of LOG_LEVEL inside the api container when it is started?",
            points: 20,
            options: [
                {
                    id: "opt_q4_a",
                    label:
                        "`warn` — Compose processes `env_file` entries in listed order and variables in later files override earlier ones, so prod.env replaces common.env for LOG_LEVEL.",
                    isCorrect: true,
                },
                {
                    id: "opt_q4_b",
                    label:
                        "`info` — Compose processes `env_file` entries from last to first, so values declared in earlier files in the list will always override values from later files in the list.",
                    isCorrect: false,
                },
                {
                    id: "opt_q4_c",
                    label:
                        "The command fails because LOG_LEVEL is defined in two different env_file sources simultaneously, and Compose treats duplicate environment keys as a fatal validation error.",
                    isCorrect: false,
                },
                {
                    id: "opt_q4_d",
                    label:
                        "The value becomes a concatenation of both definitions, producing the literal string `info,warn` inside the api container's environment for the LOG_LEVEL variable.",
                    isCorrect: false,
                },
                {
                    id: "opt_q4_e",
                    label:
                        "Neither value is set on the container, and the api process falls back to whatever default log level was baked into the my-api image at the time it was originally built.",
                    isCorrect: false,
                },
            ],
        },
        {
            id: "q_compose_not_use_case",
            type: "single_choice",
            prompt: "Which of the following is NOT a primary use case for Docker Compose?",
            points: 20,
            options: [
                {
                    id: "opt_q5_a",
                    label:
                        "Deploying a simple single-host application — for example, a blog paired with its database — to a small production server that is handling relatively low traffic.",
                    isCorrect: false,
                },
                {
                    id: "opt_q5_b",
                    label:
                        "Defining and running a multi-container local development environment for a microservices application directly on an individual developer's workstation each day.",
                    isCorrect: false,
                },
                {
                    id: "opt_q5_c",
                    label:
                        "Setting up a consistent, reproducible environment for running integration tests inside a CI/CD pipeline job before promoting a build artifact to the next stage.",
                    isCorrect: false,
                },
                {
                    id: "opt_q5_d",
                    label:
                        "Orchestrating and scaling a large multi-node cluster of containers in a high-availability production environment — that is the job of Kubernetes or Docker Swarm, not Compose.",
                    isCorrect: true,
                },
                {
                    id: "opt_q5_e",
                    label:
                        "Allowing a brand-new developer joining the team to spin up the project's complete application stack on their machine with a single command right after cloning the repo.",
                    isCorrect: false,
                },
            ],
        },
    ],
    totalPoints: 100,
    assignedStudents: [],
    status: "draft",
};

const client = new MongoClient(uri);
await client.connect();

try {
    const adminDb = client.db().admin();
    const { databases } = await adminDb.listDatabases();

    let targetDbName = null;
    for (const d of databases) {
        if (["admin", "local", "config"].includes(d.name)) continue;
        const db = client.db(d.name);
        const cols = (await db.listCollections().toArray()).map((c) => c.name);
        if (cols.includes("exams") && cols.includes("students")) {
            targetDbName = d.name;
            break;
        }
    }
    if (!targetDbName) throw new Error("Could not locate app DB containing both 'exams' and 'students' collections");
    console.log(`Target database: ${targetDbName}`);

    const db = client.db(targetDbName);

    const admin = await db.collection("users").findOne({ role: "admin" });
    if (!admin) throw new Error("No admin user found in users collection");
    console.log(`Admin user: ${admin.email} (${admin._id})`);

    const activeStudents = await db
        .collection("students")
        .find({ status: "active" }, { projection: { _id: 1, englishName: 1, email: 1, studentId: 1 } })
        .toArray();
    console.log(`Active students: ${activeStudents.length}`);
    for (const s of activeStudents) {
        console.log(`  - ${s.studentId} ${s.englishName} <${s.email || "no-email"}> ${s._id}`);
    }

    const studentIds = activeStudents.map((s) => s._id);

    const now = new Date();
    const examDoc = {
        ...exam,
        assignedStudents: studentIds,
        status: PUBLISH ? "published" : "draft",
        createdBy: admin._id,
        importedBy: admin._id,
        createdAt: now,
        updatedAt: now,
    };

    if (DRY_RUN) {
        console.log("\n--- DRY RUN: would insert into exams ---");
        console.log(JSON.stringify({ ...examDoc, questions: `<${examDoc.questions.length} questions>` }, null, 2));
        console.log(`assignedStudents count: ${studentIds.length}`);
    } else {

        const result = await db.collection("exams").insertOne(examDoc);
        console.log(`\nInserted exam _id: ${result.insertedId}`);
        console.log(`Status: ${examDoc.status}`);
        console.log(`Assigned to ${studentIds.length} active students`);
    }
} finally {
    await client.close();
}
