import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type TopicTree = {
  name: string;
  children?: TopicTree[];
};

const tree: TopicTree[] = [
  {
    name: "DSA",
    children: [
      { name: "Arrays" }, { name: "Strings" }, { name: "Hashing" },
      { name: "Two Pointers" }, { name: "Sliding Window" }, { name: "Prefix Sum" },
      { name: "Sorting" }, { name: "Binary Search" }, { name: "Bit Manipulation" },
      { name: "Math" }, { name: "Recursion" }, { name: "Backtracking" },
      { name: "Linked List" }, { name: "Stack" }, { name: "Queue" }, { name: "Heap" },
      {
        name: "Trees",
        children: [
          { name: "Binary Tree" }, { name: "BST" }, { name: "Trie" }, { name: "AVL" },
        ],
      },
      {
        name: "Graphs",
        children: [
          { name: "BFS" }, { name: "DFS" }, { name: "Topological Sort" },
          { name: "Union Find" }, { name: "Dijkstra" }, { name: "Bellman Ford" },
          { name: "Floyd Warshall" }, { name: "MST" },
        ],
      },
      { name: "Greedy" }, { name: "Dynamic Programming" }, { name: "Intervals" },
      { name: "Segment Tree" }, { name: "Fenwick Tree" }, { name: "Sparse Table" },
      { name: "Geometry" }, { name: "Miscellaneous" },
    ],
  },
  {
    name: "Computer Fundamentals",
    children: [
      { name: "Operating Systems" }, { name: "DBMS" }, { name: "Computer Networks" },
      { name: "Computer Organization & Architecture" }, { name: "Object Oriented Programming" },
      { name: "Compiler Design" }, { name: "Linux" },
    ],
  },
  {
    name: "Development",
    children: [
      { name: "HTML" }, { name: "CSS" }, { name: "JavaScript" }, { name: "TypeScript" },
      { name: "React" }, { name: "Next.js" }, { name: "Node.js" }, { name: "Express" },
      { name: "Java" }, { name: "Spring Boot" }, { name: "Python" }, { name: "REST APIs" },
      { name: "Authentication" }, { name: "Git" }, { name: "Docker" },
      { name: "Databases" }, { name: "Testing" },
    ],
  },
  { name: "Projects" },
  {
    name: "Interview Preparation",
    children: [
      { name: "HR Questions" }, { name: "Behavioral Questions" }, { name: "Mock Interviews" },
      { name: "Resume" }, { name: "Interview Experiences" }, { name: "Company-wise Notes" },
      { name: "OA Questions" },
    ],
  },
  { name: "Resources" },
];

async function createTree(nodes: TopicTree[], parentId: string | null) {
  for (const node of nodes) {
    const topic = await prisma.topic.create({
      data: {
        name: node.name,
        slug: slugify(node.name),
        parentId,
      },
    });
    if (node.children) {
      await createTree(node.children, topic.id);
    }
  }
}

async function main() {
  console.log("Seeding topics...");
  await createTree(tree, null);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });