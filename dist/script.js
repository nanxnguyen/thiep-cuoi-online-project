const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

let step = 1;
const total = 6;
const meta = [
  ['01 / PHONG CÁCH', 'Chọn cảm giác cho ngày vui.', 'Bắt đầu với một thiết kế khiến bạn thấy “đúng là mình”.'],
  ['02 / THÔNG TIN CHÍNH', 'Đặt câu chuyện vào đúng chỗ.', 'Những thông tin quan trọng, trình bày thật rõ ràng.'],
  ['03 / CÂU CHUYỆN', 'Thêm chất riêng cho ngày vui.', 'Một vài bức ảnh, một lời nhắn — vậy là đủ để thiệp thành của bạn.'],
  ['04 / KHÁCH MỜI', 'Để khách mời cảm thấy được chào đón.', 'Tương tác nhẹ nhàng, thông tin đủ dùng, không làm ai bối rối.'],
  ['05 / NHẠC NỀN', 'Chọn âm thanh của riêng hai bạn.', 'Một giai điệu đúng lúc có thể làm ký ức ở lại lâu hơn.'],
  ['06 / HOÀN TẤT', 'Thiệp đã sẵn sàng để xem.', 'Kiểm tra lần cuối rồi gửi lời mời đến những người bạn yêu quý.']
];

function toast(message) {
  const target = $('#toast');
  if (!target) return;
  target.childNodes[0].textContent = `${message} `;
  target.classList.add('show');
  window.setTimeout(() => target.classList.remove('show'), 2200);
}

function setRoute() {
  const route = window.location.hash || '#landing';
  const path = window.location.pathname;
  const isStudio = route === '#studio' || path.endsWith('/studio.html');
  const isInvite = route === '#invite' || path.endsWith('/invite.html');
  const isTemplates = route === '#templates' || path.endsWith('/templates.html');
  const landing = $('#landingPage');
  const templates = $('#templatesPage');
  const invite = $('#invitePage');
  const shell = $('.app-shell');
  const topbar = $('.topbar');
  if (landing) landing.hidden = isStudio || isInvite || isTemplates;
  if (templates) templates.hidden = !isTemplates;
  if (invite) invite.hidden = !isInvite;
  if (shell) shell.hidden = !isStudio;
  if (topbar) topbar.hidden = !isStudio;
  document.body.classList.toggle('studio-mode', isStudio);
  if (isInvite) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('groom') && $('#inviteGroom')) $('#inviteGroom').textContent = params.get('groom');
    if (params.get('bride') && $('#inviteBride')) $('#inviteBride').textContent = params.get('bride');
    if (params.get('date') && $('#inviteDate')) $('#inviteDate').textContent = params.get('date').replaceAll('-', '·');
  }
}

function previewHash() {
  const groom = $('#groom')?.value.split(' ')[0] || 'Minh';
  const bride = $('#bride')?.value.split(' ')[0] || 'An';
  const date = $('#date')?.value || '08 / 11 / 2026';
  return `?groom=${encodeURIComponent(groom)}&bride=${encodeURIComponent(bride)}&date=${encodeURIComponent(date.replaceAll(' / ', '-'))}#invite`;
}

function setStep(next) {
  step = Math.max(1, Math.min(total, next));
  $$('.editor-panel').forEach((panel) => panel.classList.toggle('active-panel', Number(panel.dataset.panel) === step));
  $$('.step-nav-item').forEach((item, index) => item.classList.toggle('active', index + 1 === step));
  const current = meta[step - 1];
  if ($('#stepLabel')) $('#stepLabel').textContent = current[0];
  if ($('#stepTitle')) $('#stepTitle').textContent = current[1];
  if ($('#stepDescription')) $('#stepDescription').textContent = current[2];
  if ($('#stepCount')) $('#stepCount').textContent = `BƯỚC ${step} / ${total}`;
  if ($('#progressValue')) $('#progressValue').textContent = `${Math.round((step / total) * 100)}%`;
  if ($('#progressBar')) $('#progressBar').style.width = `${Math.round((step / total) * 100)}%`;
  if ($('#backBtn')) $('#backBtn').disabled = step === 1;
  if ($('#nextBtn')) $('#nextBtn').innerHTML = step === total ? 'Hoàn tất <span>✓</span>' : 'Tiếp tục <span>→</span>';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

window.addEventListener('hashchange', setRoute);
$$('.step-nav-item').forEach((item) => item.addEventListener('click', () => setStep(Number(item.dataset.step))));
$('#nextBtn')?.addEventListener('click', () => step === total ? toast('Thiệp của bạn đã sẵn sàng') : setStep(step + 1));
$('#backBtn')?.addEventListener('click', () => setStep(step - 1));
$('#musicNext')?.addEventListener('click', () => setStep(6));
$('#musicBack')?.addEventListener('click', () => setStep(4));

$$('.template-pick').forEach((card) => card.addEventListener('click', () => {
  $$('.template-pick').forEach((item) => item.classList.remove('selected'));
  card.classList.add('selected');
  if ($('#previewTemplate')) $('#previewTemplate').textContent = card.dataset.template;
  toast(`Đã chọn ${card.dataset.template}`);
}));

$$('.color').forEach((color) => color.addEventListener('click', () => {
  $$('.color').forEach((item) => item.classList.remove('active'));
  color.classList.add('active');
  document.documentElement.style.setProperty('--accent', color.dataset.color);
  toast('Đã cập nhật màu chủ đạo');
}));

function bind(id, target, transform = (value) => value) {
  const input = $(`#${id}`);
  if (input) input.addEventListener('input', () => {
    if ($(`#${target}`)) $(`#${target}`).textContent = transform(input.value);
  });
}
bind('groom', 'previewGroom', (value) => value.split(' ')[0] || 'Minh');
bind('bride', 'previewBride', (value) => value.split(' ')[0] || 'An');
bind('date', 'previewDate', (value) => value.replaceAll('/', '·'));
bind('venue', 'previewVenue', (value) => value.replace(' · ', '\n'));
bind('groom', 'inviteGroom', (value) => value.split(' ')[0] || 'Minh');
bind('bride', 'inviteBride', (value) => value.split(' ')[0] || 'An');
bind('date', 'inviteDate', (value) => value.replaceAll('/', '·'));

$$('.accordion-head').forEach((head) => head.addEventListener('click', () => head.parentElement.classList.toggle('open')));
$$('.switch').forEach((toggle) => toggle.addEventListener('click', () => toggle.classList.toggle('on')));

const heroInput = $('#heroImageInput');
const uploadResult = $('#uploadResult');
const uploadPreview = $('#uploadPreview');
const uploadName = $('#uploadName');
const uploadMeta = $('#uploadMeta');
heroInput?.addEventListener('change', () => {
  const file = heroInput.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    heroInput.value = '';
    toast('Vui lòng chọn file hình ảnh');
    return;
  }
  const objectUrl = URL.createObjectURL(file);
  uploadPreview.src = objectUrl;
  uploadPreview.onload = () => URL.revokeObjectURL(objectUrl);
  uploadName.textContent = file.name;
  uploadMeta.textContent = `${file.type.replace('image/', '').toUpperCase()} · ${formatBytes(file.size)}`;
  uploadResult.hidden = false;
  toast('Đã thêm ảnh cưới');
});
$('#removeUpload')?.addEventListener('click', () => {
  heroInput.value = '';
  uploadPreview.removeAttribute('src');
  uploadResult.hidden = true;
  toast('Đã xóa ảnh');
});

const musicInput = $('#musicInput');
const musicResult = $('#musicResult');
musicInput?.addEventListener('change', () => {
  const file = musicInput.files?.[0];
  if (!file) return;
  document.body.dataset.musicFile = file.name;
  $('#musicName').textContent = file.name;
  $('#musicMeta').textContent = `${file.type || 'Audio'} · ${formatBytes(file.size)}`;
  musicResult.hidden = false;
  toast('Đã thêm nhạc nền');
});
$('#removeMusic')?.addEventListener('click', () => {
  musicInput.value = '';
  delete document.body.dataset.musicFile;
  musicResult.hidden = true;
  toast('Đã xóa nhạc nền');
});

$('#themeToggle')?.addEventListener('click', () => toast('Đã đổi giao diện'));
$('#publishBtn')?.addEventListener('click', () => toast('Bản demo đã được xuất bản'));
$('#previewBtn')?.addEventListener('click', () => { window.location.href = `invite.html${previewHash()}`; });
$('#fullPreview')?.addEventListener('click', () => { window.location.href = `invite.html${previewHash()}`; });
$('#finishPreview')?.addEventListener('click', () => { window.location.href = `invite.html${previewHash()}`; });
$('#inviteMusic')?.addEventListener('click', () => toast(document.body.dataset.musicFile ? 'Đang phát nhạc nền' : 'Thiệp này chưa có nhạc nền'));
['inviteSchedule', 'inviteGuestbook', 'inviteGift'].forEach((sectionId) => document.getElementById(sectionId)?.setAttribute('data-live-section', 'true'));
$$('.invite-rsvp').forEach((button) => button.addEventListener('click', () => toast('Form xác nhận tham dự đang sẵn sàng')));
$$('.invite-gift-button').forEach((button) => button.addEventListener('click', () => toast('Thông tin quà mừng sẽ được hiển thị tại đây')));
$('#copyLink')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(`https://moc-wedding.nguyenanhnhut0101-99.chatgpt.site/invite.html${previewHash()}`);
    toast('Đã sao chép link thiệp');
  } catch {
    toast('Link thiệp đã sẵn sàng');
  }
});

$$('a[href="#studio"]').forEach((link) => { link.href = 'studio.html'; });
$$('a[href="#templates"]').forEach((link) => { link.href = 'templates.html'; });
setRoute();
setStep(1);
