const apikeyInput = document.getElementById('apikey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');
const markdownToHTML = (text) => {
  const converter = new showdown.Converter()
  return converter.makeHtml(text)
}
const perguntarAi = async (question,game,apikey) => {
  const model = "gemini-2.5-flash"
  const urlGemini =`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apikey}`
  const pergunta = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}
    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas
    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta do uduário não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responda itens que você não tenha certeza de que existe no patch atual.
    
    ## Resposta 
    - Economize na resposta, seja direto e responda no máximo 500 caracteres.
    - Responda no formato markdown.
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.
    
    ## Exemplo de resposta
    pergunta do usuário: Melhor build rengar jungle
    resposta: A build mais atual é: \n\n **Itens:**\n\n coloque os itens aqui.\n\n**Runas:**\n\nexemplo de runas\n\n
    
    ---
    Aqui está a pergunta do usuário: ${question}
  `
  const contents =[{
    role: "user",
    parts: [{
      text: pergunta
    }]
  }]
  const tools = [{
    google_search: {}
  }]
  const response = await fetch(urlGemini,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      tools
    })
  })
  const data = await response.json();

if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
  throw new Error('Resposta inesperada da API');
}

return data.candidates[0].content.parts[0].text;
  
}
const enviarFormulario = async (event) => {
event.preventDefault();

const apikey = apikeyInput.value;
const game = gameSelect.value;
const question = questionInput.value;

if (apikey == '' || game == '' || question == '') {
    alert('Por favor, preencha todos os campos!');
    return;
  }

askButton.disabled = true;
askButton.textContent = 'Perguntando...'
askButton.classList.add('Loading')

try{
  const text = await perguntarAi(question,game,apikey)
  aiResponse.querySelector(".response-content").innerHTML = markdownToHTML(text)
  aiResponse.classList.remove('hidden')
    
  } catch(error){
    console.error('Erro ao chamar a API:', error);
    alert('Erro ao obter resposta da IA. Verifique a chave da API ou tente novamente.');
    
  } finally{
    askButton.disabled = false
    askButton.textContent = "Perguntar"
    askButton.classList.remove('Loading')
  }

};

form.addEventListener('submit', enviarFormulario);
//AIzaSyBlqaUs-JeX8qIWLysqBtFLn-a4aC423s4