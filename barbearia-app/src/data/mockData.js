// Dynamic dates of the current week (Monday to Sunday)
export const getWeekDates = () => {
  const current = new Date();
  const day = current.getDay(); // 0: Sunday, 1: Monday, etc.
  const diff = current.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday
  const monday = new Date(current.setDate(diff));
  
  const dates = {};
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayLabels = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
  const dayShortLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    dates[dayNames[i]] = {
      dateStr,
      label: dayLabels[i],
      shortLabel: dayShortLabels[i],
      formatted: `${dd}/${mm}`,
    };
  }
  return dates;
};

const week = getWeekDates();

export const professionals = [
  { id: 'nicolas', name: 'Nicolas', initials: 'NI', specialty: 'Corte & Barba', occupancy: 65 },
  { id: 'gustavo', name: 'Gustavo', initials: 'GU', specialty: 'Barba & Design', occupancy: 80 }
];

export const services = [
  { id: 'corte', name: 'Corte', price: 45, duration: 30 },
  { id: 'barba', name: 'Barba', price: 35, duration: 30 },
  { id: 'corte_barba', name: 'Corte + Barba', price: 75, duration: 60 },
  { id: 'sobrancelha', name: 'Sobrancelha', price: 20, duration: 20 }
];

// Helper to calculate fees and net amount
export const calculateNetAndFee = (price, method) => {
  if (!method) return { fee: 0, netAmount: 0 };
  switch (method) {
    case 'Não Compareceu':
      return { fee: 0, netAmount: 0 };
    case 'Dinheiro':
    case 'PIX':
      return { fee: 0, netAmount: price };
    case 'Débito':
      return { fee: parseFloat((price * 0.015).toFixed(2)), netAmount: parseFloat((price * 0.985).toFixed(2)) };
    case 'Crédito':
      return { fee: parseFloat((price * 0.03).toFixed(2)), netAmount: parseFloat((price * 0.97).toFixed(2)) };
    default:
      return { fee: 0, netAmount: price };
  }
};

const makeCompletedAppointment = (id, clientName, serviceKey, dateKey, time, professionalId, method) => {
  const service = services.find(s => s.id === serviceKey);
  const { fee, netAmount } = calculateNetAndFee(service.price, method);
  return {
    id,
    clientName,
    service: service.name,
    price: service.price,
    duration: service.duration,
    date: week[dateKey].dateStr,
    dayLabel: week[dateKey].shortLabel,
    time,
    professionalId,
    status: 'Concluído',
    paymentMethod: method,
    fee,
    netAmount
  };
};

export const initialAppointments = [
  // Monday
  makeCompletedAppointment(1, 'Lucas Silva', 'corte_barba', 'Mon', '09:00', 'nicolas', 'PIX'),
  makeCompletedAppointment(2, 'Matheus Oliveira', 'corte', 'Mon', '10:30', 'gustavo', 'Dinheiro'),
  
  // Tuesday
  {
    id: 3,
    clientName: 'Gabriel Souza',
    service: 'Barba',
    price: 35,
    duration: 30,
    date: week['Tue'].dateStr,
    dayLabel: week['Tue'].shortLabel,
    time: '14:00',
    professionalId: 'gustavo',
    status: 'Agendado',
    paymentMethod: null,
    fee: 0,
    netAmount: 0
  },
  {
    id: 4,
    clientName: 'Felipe Costa',
    service: 'Corte + Barba',
    price: 75,
    duration: 60,
    date: week['Tue'].dateStr,
    dayLabel: week['Tue'].shortLabel,
    time: '11:00',
    professionalId: 'nicolas',
    status: 'Confirmado',
    paymentMethod: null,
    fee: 0,
    netAmount: 0
  },

  // Wednesday
  makeCompletedAppointment(5, 'Rodrigo Santos', 'sobrancelha', 'Wed', '15:30', 'nicolas', 'Crédito'),
  {
    id: 6,
    clientName: 'Bruno Lima',
    service: 'Corte',
    price: 45,
    duration: 30,
    date: week['Wed'].dateStr,
    dayLabel: week['Wed'].shortLabel,
    time: '16:00',
    professionalId: 'gustavo',
    status: 'Cancelado',
    paymentMethod: null,
    fee: 0,
    netAmount: 0
  },

  // Thursday
  makeCompletedAppointment(7, 'Arthur Alves', 'corte_barba', 'Thu', '09:30', 'gustavo', 'Débito'),
  {
    id: 8,
    clientName: 'Thiago Rocha',
    service: 'Barba',
    price: 35,
    duration: 30,
    date: week['Thu'].dateStr,
    dayLabel: week['Thu'].shortLabel,
    time: '13:00',
    professionalId: 'nicolas',
    status: 'Confirmado',
    paymentMethod: null,
    fee: 0,
    netAmount: 0
  },

  // Friday (Today)
  {
    id: 9,
    clientName: 'Daniel Moreira',
    service: 'Corte',
    price: 45,
    duration: 30,
    date: week['Fri'].dateStr,
    dayLabel: week['Fri'].shortLabel,
    time: '10:00',
    professionalId: 'nicolas',
    status: 'Agendado',
    paymentMethod: null,
    fee: 0,
    netAmount: 0
  },
  makeCompletedAppointment(10, 'Gustavo Henrique', 'corte_barba', 'Fri', '14:30', 'gustavo', 'PIX'),

  // Saturday
  {
    id: 11,
    clientName: 'Pedro Mendes',
    service: 'Sobrancelha',
    price: 20,
    duration: 20,
    date: week['Sat'].dateStr,
    dayLabel: week['Sat'].shortLabel,
    time: '08:30',
    professionalId: 'nicolas',
    status: 'Agendado',
    paymentMethod: null,
    fee: 0,
    netAmount: 0
  },
  {
    id: 12,
    clientName: 'Fábio Junior',
    service: 'Corte',
    price: 45,
    duration: 30,
    date: week['Sat'].dateStr,
    dayLabel: week['Sat'].shortLabel,
    time: '11:30',
    professionalId: 'gustavo',
    status: 'Confirmado',
    paymentMethod: null,
    fee: 0,
    netAmount: 0
  }
];

export const initialInventory = [
  { id: 1, name: 'Pomada Efeito Matte 150g', category: 'Produtos', currentQuantity: 15, minimumQuantity: 5 },
  { id: 2, name: 'Shampoo para Barba 200ml', category: 'Produtos', currentQuantity: 4, minimumQuantity: 5 },
  { id: 3, name: 'Óleo Hidratante 30ml', category: 'Produtos', currentQuantity: 6, minimumQuantity: 6 },
  { id: 4, name: 'Gola Higiênica (rolo)', category: 'Descartáveis', currentQuantity: 20, minimumQuantity: 10 },
  { id: 5, name: 'Lâmina de Barbear (cx c/ 100)', category: 'Descartáveis', currentQuantity: 2, minimumQuantity: 5 },
  { id: 6, name: 'Capa de Corte de Cetim', category: 'Equipamentos', currentQuantity: 8, minimumQuantity: 5 },
  { id: 7, name: 'Máquina Detailer Wahl', category: 'Equipamentos', currentQuantity: 1, minimumQuantity: 2 },
  { id: 8, name: 'Tesoura Fio Laser 6.0', category: 'Equipamentos', currentQuantity: 3, minimumQuantity: 3 },
  { id: 9, name: 'Gel Shaving Gel 1kg', category: 'Produtos', currentQuantity: 2, minimumQuantity: 3 },
  { id: 10, name: 'Toalha de Algodão Preta', category: 'Descartáveis', currentQuantity: 12, minimumQuantity: 10 }
];

export const dailyRevenue = [
  { day: 'Seg', date: week['Mon'].formatted, total: 480 },
  { day: 'Ter', date: week['Tue'].formatted, total: 320 },
  { day: 'Qua', date: week['Wed'].formatted, total: 550 },
  { day: 'Qui', date: week['Thu'].formatted, total: 690 },
  { day: 'Sex', date: week['Fri'].formatted, total: 780 },
  { day: 'Sáb', date: week['Sat'].formatted, total: 850 },
  { day: 'Dom', date: week['Sun'].formatted, total: 350 }
];

export const subscriptionClients = [
  {
    id: 1,
    name: 'Bernardo Souza',
    initials: 'BS',
    planName: 'Corte Ilimitado',
    planPrice: 89.90,
    status: 'Ativa',
    nextBilling: '12/07/2026',
    email: 'bernardo.souza@email.com',
    phone: '(11) 98765-4321',
    cardLast4: '4589',
    paymentMethod: 'Cartão de Crédito (Visa)',
    history: [
      { id: 101, date: '12/06/2026', amount: 89.90, status: 'Pago' },
      { id: 102, date: '12/05/2026', amount: 89.90, status: 'Pago' },
      { id: 103, date: '12/04/2026', amount: 89.90, status: 'Pago' }
    ]
  },
  {
    id: 2,
    name: 'Rodrigo Lima',
    initials: 'RL',
    planName: 'Corte + Barba Mensal',
    planPrice: 129.90,
    status: 'Ativa',
    nextBilling: '15/07/2026',
    email: 'rodrigo.lima@email.com',
    phone: '(11) 99122-3344',
    cardLast4: '8832',
    paymentMethod: 'Cartão de Crédito (Mastercard)',
    history: [
      { id: 201, date: '15/06/2026', amount: 129.90, status: 'Pago' },
      { id: 202, date: '15/05/2026', amount: 129.90, status: 'Pago' },
      { id: 203, date: '15/04/2026', amount: 129.90, status: 'Pago' }
    ]
  },
  {
    id: 3,
    name: 'Aline Santos',
    initials: 'AS',
    planName: 'VIP Ilimitado',
    planPrice: 179.90,
    status: 'Ativa',
    nextBilling: '18/07/2026',
    email: 'aline.santos@email.com',
    phone: '(11) 97766-5544',
    cardLast4: '9901',
    paymentMethod: 'Cartão de Crédito (Visa)',
    history: [
      { id: 301, date: '18/06/2026', amount: 179.90, status: 'Pago' },
      { id: 302, date: '18/05/2026', amount: 179.90, status: 'Pago' },
      { id: 303, date: '18/04/2026', amount: 179.90, status: 'Pago' }
    ]
  },
  {
    id: 4,
    name: 'Matheus Ribeiro',
    initials: 'MR',
    planName: 'Corte Ilimitado',
    planPrice: 89.90,
    status: 'Ativa',
    nextBilling: '22/07/2026',
    email: 'matheus.rib@email.com',
    phone: '(11) 98877-6655',
    cardLast4: '3321',
    paymentMethod: 'Cartão de Crédito (Elo)',
    history: [
      { id: 401, date: '22/06/2026', amount: 89.90, status: 'Pago' },
      { id: 402, date: '22/05/2026', amount: 89.90, status: 'Pago' },
      { id: 403, date: '22/04/2026', amount: 89.90, status: 'Pago' }
    ]
  },
  {
    id: 5,
    name: 'Gabriel Costa',
    initials: 'GC',
    planName: 'Corte + Barba Mensal',
    planPrice: 129.90,
    status: 'Falha no pagamento',
    nextBilling: '15/06/2026',
    email: 'gabriel.costa@email.com',
    phone: '(11) 98111-2233',
    cardLast4: '5543',
    paymentMethod: 'Cartão de Crédito (Visa)',
    failureReason: 'Cartão recusado em 15/06',
    history: [
      { id: 501, date: '15/06/2026', amount: 129.90, status: 'Recusado' },
      { id: 502, date: '15/05/2026', amount: 129.90, status: 'Pago' },
      { id: 503, date: '15/04/2026', amount: 129.90, status: 'Pago' }
    ]
  },
  {
    id: 6,
    name: 'Thiago Silva',
    initials: 'TS',
    planName: 'Corte Ilimitado',
    planPrice: 89.90,
    status: 'Falha no pagamento',
    nextBilling: '22/06/2026',
    email: 'thiago.silva@email.com',
    phone: '(11) 98222-3344',
    cardLast4: '1288',
    paymentMethod: 'Cartão de Crédito (Mastercard)',
    failureReason: 'Saldo insuficiente em 22/06',
    history: [
      { id: 601, date: '22/06/2026', amount: 89.90, status: 'Recusado' },
      { id: 602, date: '22/05/2026', amount: 89.90, status: 'Pago' },
      { id: 603, date: '22/04/2026', amount: 89.90, status: 'Pago' }
    ]
  },
  {
    id: 7,
    name: 'Carlos Antunes',
    initials: 'CA',
    planName: 'Corte Ilimitado',
    planPrice: 89.90,
    status: 'Cancelada',
    nextBilling: '18/06/2026',
    email: 'carlos.ant@email.com',
    phone: '(11) 98333-4455',
    cardLast4: '8821',
    paymentMethod: 'Cartão de Crédito (Mastercard)',
    cancellationReason: 'Cancelada pelo cliente',
    cancellationDate: '18/06/2026',
    history: [
      { id: 701, date: '20/05/2026', amount: 89.90, status: 'Pago' },
      { id: 702, date: '20/04/2026', amount: 89.90, status: 'Pago' }
    ]
  },
  {
    id: 8,
    name: 'Juliana Rocha',
    initials: 'JR',
    planName: 'Corte + Barba Mensal',
    planPrice: 129.90,
    status: 'Cancelada',
    nextBilling: '12/06/2026',
    email: 'juliana.rocha@email.com',
    phone: '(11) 98444-5566',
    cardLast4: '4456',
    paymentMethod: 'Cartão de Crédito (Visa)',
    cancellationReason: 'Cancelada pelo sistema após 3 tentativas de cobrança',
    cancellationDate: '12/06/2026',
    history: [
      { id: 801, date: '12/06/2026', amount: 129.90, status: 'Falhou' },
      { id: 802, date: '10/06/2026', amount: 129.90, status: 'Falhou' },
      { id: 803, date: '08/06/2026', amount: 129.90, status: 'Falhou' }
    ]
  },
  {
    id: 9,
    name: 'Felipe Costa',
    initials: 'FC',
    planName: 'VIP Ilimitado',
    planPrice: 179.90,
    status: 'Pendente',
    nextBilling: '01/07/2026',
    email: 'felipe.costa@email.com',
    phone: '(11) 98555-6677',
    cardLast4: '2323',
    paymentMethod: 'Cartão de Crédito (Elo)',
    history: []
  }
];

export const dailyProfessionals = [
  { id: 'gustavo', name: 'Gustavo', occupancy: 80, specialty: 'Barba & Design', initials: 'GU' },
  { id: 'nicolas', name: 'Nicolas', occupancy: 65, specialty: 'Corte & Barba', initials: 'NI' }
];

export const monthlyProfessionals = [
  { id: 'gustavo', name: 'Gustavo', occupancy: 78, specialty: 'Barba & Design', initials: 'GU' },
  { id: 'nicolas', name: 'Nicolas', occupancy: 72, specialty: 'Corte & Barba', initials: 'NI' }
];

export const monthlyRevenueData = [
  { month: 'Jan', total: 12500, label: 'Janeiro' },
  { month: 'Fev', total: 14200, label: 'Fevereiro' },
  { month: 'Mar', total: 13800, label: 'Março' },
  { month: 'Abr', total: 16500, label: 'Abril' },
  { month: 'Mai', total: 18900, label: 'Maio' },
  { month: 'Jun', total: 20400, label: 'Junho' }
];

export const monthlyRevenueStats = {
  percentageChange: 8.5,
  comparisonText: 'em relação ao mês passado'
};

export const monthlyAppointmentsStats = {
  totalBase: 138,
  completedBase: 120,
  pendingBase: 18
};

export const initialGoals = [
  { id: 'g1', level: 'general', type: 'revenue', value: 8000, period: 'weekly' },
  { id: 'g2', level: 'general', type: 'occupancy', value: 75, period: 'weekly' },
  { id: 'g3', level: 'employee', professionalId: 'nicolas', type: 'appointments', value: 12, period: 'weekly' },
  { id: 'g4', level: 'employee', professionalId: 'gustavo', type: 'revenue', value: 600, period: 'weekly' }
];

export const initialChecklistTasks = [
  { id: 't1', text: 'Limpar e higienizar cadeiras e bancadas', assignedTo: 'all', completedBy: {} },
  { id: 't2', text: 'Organizar ferramentas de corte e toalhas', assignedTo: 'all', completedBy: {} },
  { id: 't3', text: 'Repor produtos de uso diário nas bancadas', assignedTo: 'all', completedBy: {} },
  { id: 't4', text: 'Efetuar contagem física do estoque crítico', assignedTo: 'nicolas', completedBy: {} },
  { id: 't5', text: 'Limpar pia e área de lavagem de cabelos', assignedTo: 'gustavo', completedBy: {} }
];

export const initialChecklistHistory = [
  { date: '2026-07-07', employeeId: 'nicolas', taskId: 't1', taskText: 'Limpar e higienizar cadeiras e bancadas', completed: true },
  { date: '2026-07-07', employeeId: 'nicolas', taskId: 't2', taskText: 'Organizar ferramentas de corte e toalhas', completed: true },
  { date: '2026-07-07', employeeId: 'gustavo', taskId: 't1', taskText: 'Limpar e higienizar cadeiras e bancadas', completed: true },
  { date: '2026-07-07', employeeId: 'gustavo', taskId: 't3', taskText: 'Repor produtos de uso diário nas bancadas', completed: true },
  { date: '2026-07-07', employeeId: 'gustavo', taskId: 't5', taskText: 'Limpar pia e área de lavagem de cabelos', completed: true }
];

export const initialMissHistory = [
  { id: 'm1', clientName: 'Felipe Costa', date: '2026-07-07', time: '11:00', professionalId: 'nicolas' }
];

