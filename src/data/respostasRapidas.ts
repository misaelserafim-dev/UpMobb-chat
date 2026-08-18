import type {
  CreateRespostaRapidaPayload,
  FetchRespostasRapidasResult,
  RespostaRapida,
  UpdateRespostaRapidaPayload,
} from "@/services/respostasRapidas.ts";

const SEED: RespostaRapida[] = [
  {
    id: "rr-001saudacao",
    shortcut: "001saudacao",
    text: "Bom dia. Como posso te ajudar?",
  },
  {
    id: "rr-002saudacao",
    shortcut: "002saudacao",
    text: "Boa tarde. Como posso te ajudar?",
  },
  {
    id: "rr-003algomais",
    shortcut: "003algomais",
    text: "Posso te ajudar com algo mais?",
  },
  {
    id: "rr-004algomais",
    shortcut: "004algomais",
    text: "Há algum outro assunto que gostaria de falar?",
  },
  {
    id: "rr-005despedida",
    shortcut: "005despedida",
    text: "Qualquer coisa, estamos à disposição. Até mais!",
  },
  {
    id: "rr-006inatividade",
    shortcut: "006inatividade",
    text: "Devido à falta de interação este atendimento será encerrado. Agradecemos o contato. Sempre que precisar, estamos à disposição! Até mais. 👋",
  },
  {
    id: "rr-007inatividade",
    shortcut: "007inatividade",
    text: "Vejo que está ocupado(a) neste momento. Podemos continuar o atendimento quando estiver disponível. Agradecemos seu contato! Até.",
  },
  {
    id: "rr-008inatividade",
    shortcut: "008inatividade",
    text: "Identificamos que você está indisponível no momento. Caso surja qualquer dúvida, fique à vontade para retomar o contato. Agradecemos a mensagem.",
  },
  {
    id: "rr-009reuniaocfm",
    shortcut: "009reuniaocfm",
    text: "Olá, tudo bem? Passando para confirmar nossa reunião agendada para daqui a 15 minutos. Estarei à disposição no link: Qualquer imprevisto, me avise por favor.",
  },
  {
    id: "rr-010reuniao",
    shortcut: "010reuniao",
    text: "A reunião ficou agendada para -dia da semana- (00/00/00) às 00:00hrs. Entraremos em contato 15 minutos antes para confirmar a reunião e te mandar o link.",
  },
  {
    id: "rr-011finalizar",
    shortcut: "011finalizar",
    text: "A Upmobb agradece seu contato. Esta é uma mensagem automática — não é necessário respondê-la. Caso haja resposta, uma nova mensagem inicial será enviada automaticamente. Em caso de dúvidas, estamos à disposição.",
  },
  {
    id: "rr-alteracaocomp",
    shortcut: "alteraçãocomp",
    text: "Solicite a alteração de componente por este link: https://tally.so/r/xXo6or",
  },
  {
    id: "rr-alterconcluida",
    shortcut: "alterconcluída",
    text: 'Olá! Venho informar que sua solicitação de (tipo de modificação) feita em (data e hora) já foi atendida. Solicitamos que faça uma limpeza de cache antes de utilizar sua modulação. Para isso, acesse o menu principal do plugin, vá em "Minhas preferências", depois em "Outros" e clique no botão de configuração ao lado de "Limpar cache de módulos". Pronto! Agora a próxima vez que baixar seus módulos eles já virão com a alteração solicitada. Em caso de dúvidas, entre em contato. Até mais!',
  },
  {
    id: "rr-baseotimizador",
    shortcut: "baseotimizador",
    text: 'Sua base no Otimizador de Plano de Corte da Upmobb será criada em até 3 dias úteis. No primeiro acesso, clique em "Esqueci minha senha :(" na tela de login para definir sua senha.',
  },
  {
    id: "rr-cravar-esp",
    shortcut: "cravar_esp",
    text: "Olá, tudo bem? Atualmente, não realizamos ajustes de espessura sob demanda para os clientes, principalmente devido aos problemas que esse tipo de alteração costuma causar. Já liberamos em alguns casos específicos, mas em 100% deles ocorreram falhas nas peças. Isso acontece porque o sistema foi desenvolvido com base em espessuras com meio milímetro a mais (como 15,5 mm, 18,5 mm etc.). Mesmo após alterar a medida, algumas configurações continuam seguindo essa lógica original, o que gera conflitos que exigem ajustes constantes. Além disso, esses milímetros a mais são essenciais nas montagens, pois funcionam como folgas para acomodar os dispositivos de fixação.",
  },
  {
    id: "rr-criacaocomp",
    shortcut: "criaçãocomp",
    text: "Solicite a criação de componente por este link: https://tally.so/r/nPrlv1",
  },
  {
    id: "rr-excluiruser",
    shortcut: "excluiruser",
    text: 'Para excluir um usuário, basta entrar no painel gestor, acessar o menu de usuários na aba "projetistas" e clicar no status deste usuário enquanto pressiona o "Ctrl" no teclado.',
  },
  {
    id: "rr-forcaroburro",
    shortcut: "forçaroburro",
    text: "Para dar continuidade ao seu atendimento, por favor, digite o número do setor com o qual deseja falar.",
  },
  {
    id: "rr-grupoclientes",
    shortcut: "/grupoclientes",
    text: "Para entrar no grupo de clientes da Upmobb use este link: https://chat.whatsapp.com/HxcRav80Upw5wIKTkhGFrs",
  },
  {
    id: "rr-grupoempnova",
    shortcut: "grupoempnova",
    text: "Se achar pertinente, vocês também podem criar um grupo e adicionar o nosso número, assim podemos solucionar dúvidas gerais dos usuários.",
  },
  {
    id: "rr-instabilidade",
    shortcut: "instabilidade",
    text: "Bom dia! Identificamos uma instabilidade no servidor que pode estar afetando o acesso e uso da plataforma. Nossa equipe já está trabalhando na resolução. Assim que o serviço for normalizado, você poderá retomar o uso normalmente. Pedimos desculpas pelo transtorno e agradecemos a compreensão.",
  },
  {
    id: "rr-instabilidadeg",
    shortcut: "instabilidadeg",
    text: "Bom dia. Informamos que o servidor está apresentando instabilidade neste momento, o que pode afetar alguns usuários. A situação já está sendo tratada e em breve estará normalizada. Pedimos que aguardem. Em caso de dúvidas, estamos à disposição.",
  },
  {
    id: "rr-integrar1",
    shortcut: "integrar1",
    text: "Olá! Tudo bem? Sou da equipe de suporte da Upmobb e estou aqui para iniciar a integração da sua empresa em nossa plataforma. Vamos acompanhar todo o processo com você. Para começarmos, poderia nos enviar os e-mails de todos os usuários que deverão ser cadastrados no plugin?",
  },
  {
    id: "rr-integrar2",
    shortcut: "integrar2",
    text: 'Para aprender a instalar e usar a ferramenta, acesse o site de tutoriais e vá até a aba de Treinamento Upmobb: https://tutoriais.upmobb.net/ Recomendo que inicie os treinamentos pela secção "Plugin Upmobb". Quando todos tiverem assistido ao treinamento completo, é só nos avisar para agendarmos uma reunião de dúvidas. Os horários disponíveis são de segunda a sexta, das 10h às 12h ou das 14h às 16h, conforme a disponibilidade da nossa equipe.',
  },
  {
    id: "rr-integrar3",
    shortcut: "integrar3",
    text: "Seguem abaixo os links de acesso às plataformas Upmobb: Painel Gestor: [link do painel gestor] Otimizador de Plano de Corte: https://app.upmobb.net/index.html O Otimizador de Plano de Corte será liberado após o envio e configuração das informações da sua CNC Router. Para isso, precisamos que nos envie aqui pelo WhatsApp: - O arquivo G-Code da máquina; - A tabela de ferramentas preenchida (em anexo).",
  },
  {
    id: "rr-integrar4",
    shortcut: "integrar4",
    text: "Temos um grupo exclusivo no WhatsApp para clientes Upmobb, onde você pode tirar dúvidas, trocar experiências e fazer networking com outros usuários da plataforma. Quer participar? É só entrar pelo link: https://chat.whatsapp.com/HxcRav80Upw5wIKTkhGFrs",
  },
  {
    id: "rr-integrar5",
    shortcut: "integrar5",
    text: "Conforme forem surgindo dúvidas vocês podem nos chamar aqui neste whatsapp. Podem enviar mensagens de texto, vídeo ou áudio para explicar as dúvidas e vamos auxiliando vocês.",
  },
  {
    id: "rr-mimnensinar",
    shortcut: "mimñensinar",
    text: "Essas questões relacionadas a componentes dinâmicos nós não abordamos por aqui. O funcionamento dos componentes dinâmicos é complexo e exige muito tempo de dedicação para compreender. Caso tenha interesse em saber mais, pode procurar por conteúdos na internet e entrar no nosso grupo de componentes, nele nossos clientes trocam experiências sobre o assunto. O link do grupo é este aqui: https://chat.whatsapp.com/CCHpYBuFiUoJuj1nw46AmR",
  },
  {
    id: "rr-novoinstalador",
    shortcut: "novoinstalador",
    text: "Baixe o instalador do plugin por este link: https://upmobb.com.br/plugin_update/get_rbz.php?key_name=upm&upmserver=v2&version=2.16.25",
  },
  {
    id: "rr-prazomodulos",
    shortcut: "prazomodulos",
    text: "Infelizmente não temos como passar um prazo pois existem outras modulações na fila e cada item a desenvolver tem uma dificuldade singular. Antes de iniciar um projeto não temos como prever sua complexidade.",
  },
  {
    id: "rr-primeirousuario",
    shortcut: "primeirousuario",
    text: "Segue o link de cadastro do usuário: [link] Quando o cadastro for feito, irá aparecer um instalador para baixar o plugin, peço que não baixe, e instale por este que vou encaminhar agora, isto para todos os usuários: https://upmobb.com.br/plugin_update/get_rbz.php?key_name=[base]&upmserver=v3&version=2.11.23 Assim que concluído por favor nos informar que o cadastro foi feito",
  },
  {
    id: "rr-reuniaoduvidas",
    shortcut: "reuniaoduvidas",
    text: "Vocês têm direito a uma reunião de dúvidas. Recomendamos assistir a todos os vídeos de treinamento antes de realizá-la, para que possam aproveitá-la da melhor forma. Caso já tenham concluído os vídeos, podemos fazer o agendamento.",
  },
  {
    id: "rr-servico",
    shortcut: "serviço",
    text: 'Os cadastros de serviços são organizados por tipo: furo, rebaixo e usinagem. Para saber em qual tipo cadastrar o código solicitado pelo sistema, observe o texto que aparece antes do código. Exemplos: "o rebaixo usi_line" → cadastrar em Rebaixo "a usinagem usi_line" → cadastrar em Usinagem "o furo f_3mm" → cadastrar em Furos Basta identificar o termo antes do código e cadastrá-lo na coluna correspondente.',
  },
];

let respostas = SEED.map((r) => ({ ...r }));

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueId(shortcut: string) {
  const base = slugify(shortcut) || "resposta";
  let id = `rr-${base}`;
  let n = 1;
  while (respostas.some((r) => r.id === id)) {
    n += 1;
    id = `rr-${base}-${n}`;
  }
  return id;
}

function parseQuery(path: string) {
  const qIndex = path.indexOf("?");
  if (qIndex < 0) return { pathname: path, search: new URLSearchParams() };
  return {
    pathname: path.slice(0, qIndex),
    search: new URLSearchParams(path.slice(qIndex + 1)),
  };
}

export async function mockRespostasRapidasRequest(
  method: string,
  path: string,
  body?: unknown,
): Promise<unknown> {
  const { pathname, search } = parseQuery(path);
  const m = method.toUpperCase();

  if (m === "GET" && pathname === "/respostas-rapidas") {
    const limitRaw = search.get("limit");
    if (limitRaw != null) {
      const q = (search.get("q") || "").trim().toLowerCase();
      const limit = Math.min(20, Math.max(1, Number(limitRaw) || 8));
      const list = q
        ? respostas.filter((r) => r.shortcut.toLowerCase().includes(q))
        : respostas;
      return list.slice(0, limit).map((r) => ({ ...r }));
    }

    const page = Math.max(1, Number(search.get("page") || 1));
    const pageSize = Math.min(100, Math.max(10, Number(search.get("pageSize") || 40)));
    const q = (search.get("q") || "").trim().toLowerCase();

    const filtered = q
      ? respostas.filter(
          (r) =>
            r.shortcut.toLowerCase().includes(q) || r.text.toLowerCase().includes(q),
        )
      : respostas;

    const start = (page - 1) * pageSize;
    const result: FetchRespostasRapidasResult = {
      items: filtered.slice(start, start + pageSize).map((r) => ({ ...r })),
      total: filtered.length,
      page,
      pageSize,
    };
    return result;
  }

  if (m === "POST" && pathname === "/respostas-rapidas") {
    const payload = body as CreateRespostaRapidaPayload;
    const created: RespostaRapida = {
      id: uniqueId(payload.shortcut),
      shortcut: payload.shortcut.trim(),
      text: payload.text.trim(),
    };
    respostas = [...respostas, created];
    return { ...created };
  }

  const match = pathname.match(/^\/respostas-rapidas\/([^/]+)$/);
  if (match) {
    const id = decodeURIComponent(match[1]);

    if (m === "PUT") {
      const payload = body as Omit<UpdateRespostaRapidaPayload, "id">;
      const current = respostas.find((r) => r.id === id);
      if (!current) throw new Error("Resposta rápida não encontrada");

      const next: RespostaRapida = {
        ...current,
        shortcut: payload.shortcut.trim(),
        text: payload.text.trim(),
      };
      respostas = respostas.map((r) => (r.id === id ? next : r));
      return { ...next };
    }

    if (m === "DELETE") {
      respostas = respostas.filter((r) => r.id !== id);
      return { id };
    }
  }

  throw new Error(`Mock route not found: ${m} ${pathname}`);
}
