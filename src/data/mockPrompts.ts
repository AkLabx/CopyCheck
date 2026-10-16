export interface QuestionPrompt {
  id: string;
  exam: 'UPSC' | 'BPSC';
  paper: string;
  year?: string;
  topic: string;
  directive: string;
  questionText: string;
  maxMarks: number;
  wordLimit: number;
  sampleStudentAnswer: string;
  rubricFocus: string[];
}

export const QUESTION_LIBRARY: QuestionPrompt[] = [
  {
    id: 'upsc-gs2-federalism',
    exam: 'UPSC',
    paper: 'GS Paper 2 (Polity & Governance)',
    year: 'UPSC Mains 2023',
    topic: 'Fiscal Federalism & Inter-State Council',
    directive: 'Critically Analyze',
    questionText: '“The dynamics of Indian fiscal federalism have undergone significant shifts with the introduction of GST and changes in Finance Commission devolution criteria.” Critically analyze the emerging frictions and suggest measures to strengthen cooperative federalism.',
    maxMarks: 15,
    wordLimit: 250,
    rubricFocus: [
      'Directive adherence (balanced critique of GST & devolution friction vs national market efficiency)',
      'Constitutional Articles (Art 279A, 280, 263)',
      'Empirical data on vertical vs horizontal devolution',
      '15th Finance Commission criteria (demographic performance vs income distance)',
      'Punchhi & Sarkaria Commission recommendations'
    ],
    sampleStudentAnswer: `Indian federalism is very important for democracy. The GST was launched in 2017 to create one nation one tax. It has given many advantages to the Indian economy like removing cascading of taxes and helping tax collection reach record levels. But state governments are having huge problems with their revenues.

States lost their power to tax petroleum and alcohol, and they rely heavily on central compensation which ended in 2022. Because of this, states feel their fiscal autonomy has been damaged. Also, the 15th Finance Commission used the 2011 census instead of the 1971 census. This makes southern states unhappy because they controlled population well but got less money.

To make things better, the central government should give more money to states without putting conditions. The Inter-State Council should meet frequently. If center and state work together nicely, India will grow fast and become a 5 trillion dollar economy.`
  },
  {
    id: 'upsc-gs3-inclusive-growth',
    exam: 'UPSC',
    paper: 'GS Paper 3 (Economy & Tech)',
    year: 'UPSC Mains 2024',
    topic: 'Manufacturing & Jobless Growth',
    directive: 'Discuss',
    questionText: 'Discuss how the paradox of high GDP growth accompanied by subdued employment generation can be resolved through structural reforms in India’s manufacturing and MSME sectors.',
    maxMarks: 10,
    wordLimit: 150,
    rubricFocus: [
      'Explanation of jobless growth paradox (K-shaped recovery, capital-intensive manufacturing)',
      'MSME credit gap and formalization challenges',
      'PLI scheme assessment and value-addition',
      'Labor reforms and skill development integration'
    ],
    sampleStudentAnswer: `India is one of the fastest growing major economies in the world with GDP growth over 7%. However, this growth has not created sufficient jobs for our large youth population, leading to what economists call jobless growth.

Most investment is going into capital-intensive sectors like IT and automation instead of labor-intensive manufacturing. The MSME sector which provides 11 crore jobs faces high interest rates and compliance burdens. Schemes like Make in India and PLI have benefited large firms more than small enterprises.

To solve this problem, we need to support MSMEs with collateral-free loans under MUDRA, reform labor regulations, and improve vocational training. Expanding textile, leather, and food processing will generate mass employment.`
  },
  {
    id: 'bpsc-gs2-bihar-polity',
    exam: 'BPSC',
    paper: 'BPSC GS Paper 2 (Polity & Bihar Governance)',
    year: '69th BPSC Mains',
    topic: 'Decentralization & Panchayati Raj in Bihar',
    directive: 'Examine',
    questionText: 'Examine the role of 50% reservation for women in Panchayati Raj Institutions in empowering rural women in Bihar. What institutional bottlenecks still impede substantive gender justice at the grassroots?',
    maxMarks: 38,
    wordLimit: 400,
    rubricFocus: [
      'Bihar Panchayati Raj Act 2006 (1st state with 50% reservation)',
      'Substantive vs Symbolic empowerment (Pati-Panchayat phenomenon)',
      'Self-Help Groups integration (Jeevika model)',
      'Administrative training, digital literacy, and financial devolution'
    ],
    sampleStudentAnswer: `Bihar was the pioneer state in India to implement 50 percent reservation for women in Panchayati Raj Institutions under the Bihar Panchayati Raj Act of 2006. This revolutionary step has drastically changed the local politics of Bihar.

Thousands of women from backward classes and rural backgrounds entered village panchayats as Mukhiyas and Sarpanchs. It helped in breaking caste and gender taboos and inspired young girls in villages. Combined with the World Bank funded Jeevika project, rural women gained financial and social confidence.

However, several bottlenecks still remain. In many villages, the phenomenon of "Mukhiya Pati" or "Pradhan Pati" is common, where the husband or male relative exercises real administrative power while the elected woman remains a rubber stamp. Women representatives also lack technical training about budget allocations and government schemes.

To make empowerment real, the government must conduct continuous leadership workshops, enforce strict penalties against proxy governance, and integrate women panchayat heads directly into planning committees.`
  },
  {
    id: 'bpsc-gs1-patna-kalam',
    exam: 'BPSC',
    paper: 'BPSC GS Paper 1 (History & Culture of Bihar)',
    year: '68th BPSC Mains',
    topic: 'Patna Kalam Painting & Cultural Legacy',
    directive: 'Elucidate',
    questionText: 'Elucidate the salient features of Patna Kalam painting. How did it differ from the Mughal and British Company schools of art in themes, medium, and patron patronage?',
    maxMarks: 38,
    wordLimit: 350,
    rubricFocus: [
      'Origin: Decline of Mughal court, migration to Patna (Lodi Katra, Machharhatta)',
      'Unique features: Kajli Siyahi (brush painting without pencil sketch)',
      'Themes: Common man, daily bazaar life, artisans (washerman, blacksmith)',
      'Comparison matrix with Imperial Mughal court and Company School',
      'Prominent artists: Sewak Ram, Hulas Lal, Shiv Lal'
    ],
    sampleStudentAnswer: `Patna Kalam is a world famous miniature painting style which developed in Bihar during the 18th and 19th centuries. When the Mughal empire declined after Aurangzeb, court artists migrated from Delhi to Murshidabad and finally settled in Patna.

The most distinctive feature of Patna Kalam is its common people themes. Unlike Mughal paintings which showed royal courts, hunting scenes, and kings, Patna Kalam artists painted the daily life of ordinary people like carpenters, water carriers, washermen, and bird sellers.

Another key feature was the "Kajli Siyahi" technique, where painters drew directly with fine brushes made of squirrel hair without making any pencil outline first. Colors were made naturally from lampblack, indigo, and clay.

It differed from Company style because it maintained traditional Indian warmth, though it adopted European shading techniques. Patna Kalam reflects the rich artistic heritage of Bihar.`
  },
  {
    id: 'upsc-essay-philosophical',
    exam: 'UPSC',
    paper: 'Essay Paper',
    year: 'UPSC Mains 2022',
    topic: 'Philosophical & Socio-Ethical',
    directive: 'Elaborate with Multidimensional Perspectives',
    questionText: '“Forests precede civilizations and deserts follow them.” In the context of the Anthropocene epoch and planetary boundaries, elaborate on the philosophical and governance imperatives for sustainable coexistence.',
    maxMarks: 125,
    wordLimit: 1000,
    rubricFocus: [
      'Philosophical hook (Chateaubriand quote, ecological ethics, Anthropocene)',
      'Historical trajectory (Mesopotamia, Indus Valley ecological decline)',
      'Multidimensional analysis (Capitalism vs ecology, environmental justice, indigenous wisdom)',
      'Global and national governance (COP treaties, Mission LiFE, Art 48A & 51A(g))',
      'Harmonious vision (Ecocentrism over anthropocentrism)'
    ],
    sampleStudentAnswer: `The quote "Forests precede civilizations and deserts follow them" was originally stated by the French romantic writer Chateaubriand. It captures how human development has historically destroyed ecological balance. 

Civilizations arose in fertile river basins covered with dense forests. However, excessive exploitation of natural resources, deforestation for agriculture, and urban greed turned lush green landscapes into barren wastelands. Ancient civilizations like Mesopotamia and the Maya collapsed largely due to ecological degradation and water mismanagement.

In our current Anthropocene epoch, this destruction has reached a planetary scale. Climate change, melting glaciers, and loss of biodiversity threaten human survival. Economic growth based on endless consumption is unsustainable. We must adopt sustainable development, renewable energy, and protect tribal forest rights under the Forest Rights Act. As Mahatma Gandhi said, the earth has enough for everyone's need but not for anyone's greed.`
  }
];
