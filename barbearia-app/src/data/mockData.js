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

export const subscriptionClients = {
  clientA: {
    id: 'clientA',
    name: 'Bernardo Souza',
    planName: 'Plano Mensal Corte Ilimitado',
    planPrice: 'R$ 89,90/mês',
    status: 'Ativo',
    nextBilling: '12/07/2026',
    cardLast4: '4589',
    history: [
      { id: 101, service: 'Corte', date: '02/06/2026', professional: 'Nicolas' },
      { id: 102, service: 'Corte', date: '11/06/2026', professional: 'Nicolas' },
      { id: 103, service: 'Corte', date: '22/06/2026', professional: 'Gustavo' }
    ]
  },
  clientB: {
    id: 'clientB',
    name: 'Carlos Antunes',
    planName: 'Plano Mensal Corte Ilimitado',
    planPrice: 'R$ 89,90/mês',
    status: 'Expirado',
    nextBilling: '20/06/2026', // Expired on this date
    cardLast4: '8821',
    history: [
      { id: 104, service: 'Corte', date: '25/05/2026', professional: 'Gustavo' },
      { id: 105, service: 'Corte', date: '05/06/2026', professional: 'Nicolas' }
    ]
  }
};

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
