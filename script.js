const sourceTextArea = document.getElementById('source-text');
const threadContainer = document.getElementById('thread-container');
const charCount = document.getElementById('char-count');
const toast = document.getElementById('toast');

const inputName = document.getElementById('input-name');
const inputHandle = document.getElementById('input-handle');
const profilePreview = document.getElementById('profile-preview');
const removeImageBtn = document.getElementById('remove-image-btn');

const MAX_LENGTH = 140; 

let generatedtwees = [];
let profileConfig = {
    name: "Writer",
    handle: "bb_uu_t.stm",
    colorClass: "from-indigo-500 to-purple-600",
    iconClass: "fa-pen-nib",
    imageSrc: null
};

const colorMap = {
    'indigo': 'from-indigo-500 to-purple-600',
    'emerald': 'from-emerald-400 to-teal-600',
    'rose': 'from-rose-400 to-pink-500',
    'amber': 'from-amber-400 to-orange-500',
    'sky': 'from-sky-400 to-blue-500',
    'slate': 'from-slate-500 to-gray-700'
};

sourceTextArea.addEventListener('input', () => {
    charCount.textContent = `${sourceTextArea.value.length.toLocaleString()}자 입력됨`;
});

inputName.addEventListener('input', (e) => {
    profileConfig.name = e.target.value || "Writer";
    if(generatedtwees.length > 0) rendertwees(generatedtwees);
});

inputHandle.addEventListener('input', (e) => {
    profileConfig.handle = e.target.value || "bb_uu_t.stm";
    if(generatedtwees.length > 0) rendertwees(generatedtwees);
});

function generateThread() {
    const rawText = sourceTextArea.value.trim();
    
    if (!rawText) {
        showToast("변환할 텍스트를 입력해주세요.");
        return;
    }

    const paragraphs = rawText.split(/\n\s*\n/);
    let twees = [];
    
    paragraphs.forEach(para => {
        if (para.length <= MAX_LENGTH) {
            if (para.trim()) twees.push(para.trim());
            return;
        }

        const sentences = para.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [para];
        let currenttwee = "";

        sentences.forEach(sentence => {
            sentence = sentence.trim();
            if (!sentence) return;

            if ((currenttwee + " " + sentence).length <= MAX_LENGTH) {
                currenttwee += (currenttwee ? " " : "") + sentence;
            } else {
                if (currenttwee) twees.push(currenttwee);
                
                if (sentence.length > MAX_LENGTH) {
                    let remaining = sentence;
                    while (remaining.length > 0) {
                        let splitIndex = remaining.lastIndexOf(' ', MAX_LENGTH);
                        if (splitIndex === -1 || splitIndex < MAX_LENGTH * 0.5) {
                            splitIndex = MAX_LENGTH;
                        }
                        if (remaining.length <= MAX_LENGTH) {
                            splitIndex = remaining.length;
                        }
                        twees.push(remaining.substring(0, splitIndex).trim());
                        remaining = remaining.substring(splitIndex).trim();
                    }
                    currenttwee = "";
                } else {
                    currenttwee = sentence;
                }
            }
        });

        if (currenttwee) twees.push(currenttwee);
    });

    generatedtwees = twees;
    rendertwees(twees);
    showToast(`${twees.length}개의 글타래로 변환되었습니다.`);
    
    if(window.innerWidth < 768) {
        threadContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

function rendertwees(twees) {
    threadContainer.innerHTML = ''; 

    twees.forEach((text, index) => {
        const isLast = index === twees.length - 1;
        const counter = `${index + 1}/${twees.length}`;
        
        let avatarHtml = '';
        if (profileConfig.imageSrc) {
            avatarHtml = `
                <div class="absolute left-4 top-5 w-10 h-10 rounded-lg overflow-hidden shadow-sm z-10 border border-slate-100 bg-white">
                    <img src="${profileConfig.imageSrc}" class="w-full h-full object-cover" alt="Profile">
                </div>
            `;
        } else {
            avatarHtml = `
                <div class="absolute left-4 top-5 w-10 h-10 rounded-lg bg-gradient-to-br ${profileConfig.colorClass} flex items-center justify-center text-white shadow-sm z-10 transition-colors duration-300">
                    <i class="fa-solid ${profileConfig.iconClass} text-sm"></i>
                </div>
            `;
        }
        
        const tweeHtml = `
            <div class="card-item relative pl-16 pr-6 py-5 bg-white hover:bg-slate-50 transition border border-slate-100 ${index === 0 ? 'rounded-t-2xl' : ''} ${isLast ? 'rounded-b-2xl border-b' : 'border-b-0'} shadow-sm">
                <div class="thread-line"></div>
                
                ${avatarHtml}

                <div class="flex flex-col">
                    <div class="flex items-baseline justify-between mb-2">
                        <div class="flex items-center gap-2 overflow-hidden">
                            <span class="font-bold text-slate-900 text-sm truncate max-w-[120px]">${escapeHtml(profileConfig.name)}</span>
                            <span class="text-slate-400 text-xs truncate max-w-[100px]">@${escapeHtml(profileConfig.handle)}</span>
                        </div>
                        <span class="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">${counter}</span>
                    </div>
                    
                    <p class="text-slate-700 text-[15px] leading-relaxed whitespace-pre-wrap mb-3">${text}</p>
                    
                    <div class="flex gap-6 text-slate-300 text-sm mt-1">
                        <button class="hover:text-indigo-500 transition"><i class="fa-regular fa-comment-dots"></i></button>
                        <button class="hover:text-emerald-500 transition"><i class="fa-solid fa-share-nodes"></i></button>
                        <button class="hover:text-pink-500 transition"><i class="fa-regular fa-bookmark"></i></button>
                        <button class="hover:text-indigo-500 transition ml-auto" onclick="copySingletwee('${escapeHtml(text)}')"><i class="fa-regular fa-copy"></i></button>
                    </div>
                </div>
            </div>
        `;
        threadContainer.insertAdjacentHTML('beforeend', tweeHtml);
    });
}

function setProfileColor(colorKey) {
    profileConfig.colorClass = colorMap[colorKey];
    
    const buttons = document.querySelectorAll('#color-options button');
    buttons.forEach(btn => {
        btn.classList.remove('ring-2', 'ring-offset-2');
        if(btn.onclick.toString().includes(colorKey)) {
                btn.classList.add('ring-2', 'ring-offset-2', `ring-${colorKey}-500`);
        }
    });

    if(generatedtwees.length > 0) rendertwees(generatedtwees);
}

function handleImageUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            profileConfig.imageSrc = e.target.result;
            
            profilePreview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
            profilePreview.classList.remove('border-dashed', 'border-slate-300', 'bg-slate-100');
            profilePreview.classList.add('border-solid', 'border-indigo-200');
            
            removeImageBtn.classList.remove('hidden');

            if(generatedtwees.length > 0) rendertwees(generatedtwees);
            
            showToast("프로필 사진이 적용되었습니다.");
        }
        
        reader.readAsDataURL(input.files[0]);
    }
}

function removeProfileImage() {
    profileConfig.imageSrc = null;
    
    document.getElementById('image-upload').value = '';
    
    profilePreview.innerHTML = '<i class="fa-solid fa-camera"></i>';
    profilePreview.classList.add('border-dashed', 'border-slate-300', 'bg-slate-100');
    profilePreview.classList.remove('border-solid', 'border-indigo-200');
    
    removeImageBtn.classList.add('hidden');
    
    if(generatedtwees.length > 0) rendertwees(generatedtwees);
    
    showToast("기본 아이콘으로 복구되었습니다.");
}

function switchTab(tab) {
    const tabText = document.getElementById('tab-text');
    const tabProfile = document.getElementById('tab-profile');
    const areaText = document.getElementById('input-area-text');
    const areaProfile = document.getElementById('input-area-profile');

    if (tab === 'text') {
        tabText.classList.replace('text-slate-400', 'text-indigo-600');
        tabText.classList.add('border-b-2', 'border-indigo-600');
        tabProfile.classList.replace('text-indigo-600', 'text-slate-400');
        tabProfile.classList.remove('border-b-2', 'border-indigo-600');
        
        areaText.classList.remove('hidden');
        areaProfile.classList.add('hidden');
    } else {
        tabProfile.classList.replace('text-slate-400', 'text-indigo-600');
        tabProfile.classList.add('border-b-2', 'border-indigo-600');
        tabText.classList.replace('text-indigo-600', 'text-slate-400');
        tabText.classList.remove('border-b-2', 'border-indigo-600');

        areaProfile.classList.remove('hidden');
        areaText.classList.add('hidden');
    }
}

function clearText() {
    sourceTextArea.value = '';
    charCount.textContent = '0자 입력됨';
    generatedtwees = [];
    threadContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
            <i class="fa-solid fa-layer-group text-4xl mb-3 text-indigo-100"></i>
            <p>내용이 초기화되었습니다.</p>
        </div>
    `;
}

function insertDemoText() {
    const demoText = `'박제(剝製)가 되어 버린 천재'를 아시오? 나는 유쾌하오. 이런 때 연애까지가 유쾌하오.\n\n육신이 흐느적흐느적하도록 피로했을 때만 정신이 은화처럼 맑소. 니코틴이 내 횟배 앓는 뱃속으로 스미면 머릿속에 으레 백지가 준비되는 법이오. 그 위에다 나는 위트와 파라독스를 바둑 포석처럼 늘어 놓소. 가공할 상식의 병이오. 나는 또 여인과 생활을 설계하오. 연애기법에마저 서먹서먹해진 지성의 극치를 흘깃 좀 들여다본 일이 있는, 말하자면 일종의 정신분일자(정신이 제멋대로 노는 사람)말이오. 이런 여인의 반----그것은 온갖 것의 반이오.---만을 영수(받아들이는)하는 생활을 설계한다는 말이오. 그런 생활 속에 한 발만 들여놓고 흡사 두 개의 태양처럼 마주 쳐다보면서 낄낄거리는 것이오. 나는 아마 어지간히 인생의 제행(諸行)(일체의 행위)이 싱거워서 견딜 수가 없게 끔 되고 그만둔 모양이오. 굿바이. 굿바이. 그대는 이따금 그대가 제일 싫어하는 음식을 탐식하는 아이로니를 실천해 보는 것도 놓을 것 같소. 위트와 파라독스와……. 그대 자신을 위조하는 것도 할 만한 일이오. 그대의 작품은 한번도 본 일이 없는 기성품에 의하여 차라리 경편(輕便)하고(가뜬하여 쓰기에 손쉽고 편하고) 고매하리다.`;
    
    sourceTextArea.value = demoText;
    switchTab('text');
    showToast("예시 텍스트가 입력되었습니다.");
    generateThread();
}

function copyAlltwees() {
    if (generatedtwees.length === 0) {
        showToast("복사할 내용이 없습니다.");
        return;
    }

    let allText = "";
    generatedtwees.forEach((text, idx) => {
        allText += `[${idx+1}/${generatedtwees.length}] ${text}\n\n`;
    });

    navigator.clipboard.writeText(allText).then(() => {
        showToast("전체 타래가 복사되었습니다.");
    });
}

function copySingletwee(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast("글타래 내용이 복사되었습니다.");
    });
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('opacity-0');
    toast.classList.add('opacity-100');
    
    setTimeout(() => {
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0');
    }, 2500);
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}