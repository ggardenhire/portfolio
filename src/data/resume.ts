// ============================================================================
// EDIT YOUR RESUME HERE
// ----------------------------------------------------------------------------
// This is the single source of truth for everything the site displays.
// Change the values below, commit, and push to `main` — the container will
// pull, rebuild, and redeploy automatically. No code changes required.
// ============================================================================

export interface Experience {
  company: string
  role: string
  period: string
  location?: string
  highlights: string[]
}

export interface SkillGroup {
  category: string
  items: string[]
}

export interface Education {
  school: string
  degree: string
  period: string
  notes?: string[]
}

export interface Certification {
  name: string
  issuer?: string
}

export interface Resume {
  name: string
  handle: string
  title: string
  tagline: string
  email: string
  links: { label: string; href: string }[]
  summary: string
  skills: SkillGroup[]
  experience: Experience[]
  leadership: Experience[]
  education: Education[]
  certifications: Certification[]
}

export const resume: Resume = {
  name: 'Garret Gardenhire',
  handle: 'ggardenhire',
  title: 'Senior DevSecOps Engineer',
  tagline: 'Building and securing cloud-native platforms — from pipeline to production.',
  email: 'garretgardenhire@gmail.com',

  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/garretgardenhire' },
    { label: 'GitHub', href: 'https://github.com/ggardenhire' },
    { label: 'Email', href: 'mailto:garretgardenhire@gmail.com' },
  ],

  summary:
    'Software and Platform Engineer with 6+ years of experience designing, developing, and automating cloud-native platforms across AWS, Kubernetes, and enterprise environments. Experienced in Kubernetes architecture, Python/FastAPI services, REST APIs, infrastructure-as-code, CI/CD, workflow automation, and enterprise platform operations. Proven track record of leading technical initiatives, mentoring engineers, and replacing manual infrastructure processes with scalable, reliable automation.',

  skills: [
    {
      category: 'Cloud & Platform',
      items: ['AWS', 'EKS', 'Kubernetes', 'Crossplane', 'Terraform', 'SpectroCloud Palette', 'Helm'],
    },
    {
      category: 'Automation & CI/CD',
      items: ['FastAPI', 'Bash', 'Ansible', 'Argo Workflows', 'GitHub Actions', 'ServiceNow'],
    },
    {
      category: 'Security & Identity',
      items: ['HashiCorp Vault', 'OIDC', 'LDAP', 'Kubernetes AuthN/AuthZ'],
    },
    {
      category: 'Infrastructure & Operations',
      items: ['Linux', 'Docker', 'NetApp', 'iDRAC', 'Redfish', 'vSphere'],
    },
    {
      category: 'Programming',
      items: ['Python', 'C++', 'C#', 'Java', 'JavaScript'],
    },
  ],

  experience: [
    {
      company: 'Enterprise Vision Technologies',
      role: 'Automation/DevOps Engineering Consultant',
      period: 'Feb 2020 — Present',
      highlights: [
        "Architected and implemented Merck Sharp & Dohme's first internal Managed Kubernetes Platform to accelerate R&D, manufacturing, and product development. Built on Argo Workflows, SpectroCloud Palette, AWS EKS, Terraform, and GitHub Actions, the platform was architected to scale to thousands of clusters across public cloud and on-premises vSphere environments.",
        'Led a 4-person engineering team in designing and implementing a Crossplane-based Universal Control Plane architecture for cloud and edge Kubernetes infrastructure; developed Crossplane Compositions and Python automation to provision customer resources, configure access and permissions, and automate customer onboarding. Authored the platform architecture and presented the design to technical leadership and clients.',
        "Designed and implemented the migration of American Airlines' HashiCorp Vault authentication from LDAP to OIDC across a platform supporting approximately 2,000 customer namespaces; managed Kubernetes integration, Vault Agent, access policies, and ongoing platform operations and maintenance.",
        'Designed and implemented Ansible automation for NetApp storage lifecycle management and disaster recovery procedures, enabling repeatable execution during biannual regulatory exercises.',
        'Converted Merck’s manual procedure of device configuration/testing into an automated Ansible playbook with the capabilities to run over all devices in an environment to verify they met government regulatory standards.',
        'Automated AWS EC2 provisioning through Ansible and ServiceNow, reducing a four-week manual provisioning process to approximately half a day and creating a repeatable solution subsequently demonstrated to Fortune 500 clients.',
      ],
    },
  ],

  leadership: [
    {
      company: 'Kappa Kappa Psi (KKΨ)',
      role: 'Southwest District Governor / Committee Chair',
      period: 'July 2022 — Present',
      highlights: [
        'Manage and mentor college band organizations across 5 states alongside 2 other governors. This role includes event planning for a yearly convention, mentoring chapters and student district leaders in their positions of college leadership, and ensuring all chapters maintain nonprofit compliance.',
      ],
    },
  ],

  education: [
    {
      school: 'University of Arkansas',
      degree: 'B.S. Mechanical Engineering, Minor in Computer Science',
      period: '2020',
      notes: ['GPA: 3.813', 'Honors College Fellow'],
    },
  ],

  certifications: [
    { name: 'Certified Kubernetes Administrator', issuer: 'CNCF' },
    { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services' },
    { name: 'AWS Certified Developer – Associate', issuer: 'Amazon Web Services' },
    { name: 'Microsoft Certified: Azure Fundamentals', issuer: 'Microsoft' },
  ],
}
