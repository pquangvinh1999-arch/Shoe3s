        // ==========================================
        // CONFIGURATION - ĐIỀN THÔNG TIN SUPABASE
        // ==========================================
        // F5 (P10-T01, 2026-08-03): migrate sang production project vmakonkiotjkxlhpjwny
        // (publishable key mới sau rotate; legacy anon key đã lộ → revoke trong dashboard)
        const SUPABASE_URL = 'https://vmakonkiotjkxlhpjwny.supabase.co'; 
        const SUPABASE_KEY = 'sb_publishable_WPMLea8mF-BtOWmMkJ308Q_sem38QoF';
        // ==========================================
        // BẢO MẬT: Token và Chat ID đã được chuyển lên backend (Cloudflare Functions).
        // KHÔNG khai báo plain-text ở đây nữa!
        // ==========================================
        // ==========================================
        // CẤU HÌNH THÔNG TIN TÀI KHOẢN NGÂN HÀNG (VIETQR)
        // ==========================================
        const BANK_BIN = '970436';             // Mã BIN của Vietcombank (Tra cứu danh sách BIN ngân hàng khác trong tài liệu VietQR)
        const BANK_ACCOUNT = '1031240845';       // Số tài khoản ngân hàng thụ hưởng
        const BANK_ACCOUNT_NAME = 'PHAM QUANG VINH'; // Tên người sở hữu tài khoản (Không dấu)
        const BANK_TEMPLATE = 'print';           // Loại template QR (print, compact, compact2, qr_only)

        // KHỞI TẠO CLIENT
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        // F3: escape HTML trước khi render user data vào innerHTML (chống stored XSS)
        function esc(value) {
            return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
            })[ch]);
        }

        // Biến toàn cục để liên kết Đơn hàng từ Landing khi tiến hành Thanh toán
        let pendingBookingId = null;

        // -----------------------------------------------------
        // 1. ROUTING & AUTH
        // -----------------------------------------------------
        document.addEventListener("DOMContentLoaded", async () => {
            const params = new URLSearchParams(window.location.search);
            if (params.get('page') === 'order') {
                document.getElementById('landing-view').classList.remove('hidden');
                initSlideshow();
            } else {
                try {
                    const { data: { session } } = await supabaseClient.auth.getSession();
                    if (session) {
                        document.getElementById('login-view').classList.add('hidden');
                        document.getElementById('admin-view').classList.remove('hidden');
                        updateDashboard();
                    } else {
                        document.getElementById('login-view').classList.remove('hidden');
                    }
                } catch (e) {
                    console.error("Auth Error:", e);
                    document.getElementById('login-view').classList.remove('hidden');
                }
            }
        });

        async function doLogin() {
            const email = document.getElementById('user').value;
            const password = document.getElementById('pass').value;
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

            if (error) {
                alert('Sai tài khoản hoặc mật khẩu! ' + error.message);
            } else {
                document.getElementById('login-view').classList.add('hidden');
                document.getElementById('admin-view').classList.remove('hidden');
                updateDashboard();
            }
        }

        async function logout() {
            await supabaseClient.auth.signOut();
            location.reload();
        }

        // -----------------------------------------------------
        // 2. LANDING PAGE LOGIC
        // -----------------------------------------------------
        let selectedServices = [];

        const serviceByName = Object.fromEntries(getServiceCatalog().map(svc => [svc.name, svc]));

        function toStep2() {
            const n = document.getElementById('cus-name').value;
            const p = document.getElementById('cus-phone').value;
            if(!n || !p) return alert("Điền tên và SĐT anh nhé!");
            document.getElementById('show-name').innerText = n;
            document.getElementById('step-1').classList.add('hidden');
            document.getElementById('step-2').classList.remove('hidden');
        }

        function toggleSvc(el, name) {
            el.classList.toggle('selected');
            const idx = selectedServices.findIndex(s => s.name === name);
            if (idx > -1) selectedServices.splice(idx, 1);
            else selectedServices.push({ name, id: getServiceByName(name)?.id || null });
        }

        // Turnstile callbacks: lưu token hợp lệ vào hidden input
        function onTurnstileToken(token) {
            const input = document.getElementById('turnstile-token');
            const status = document.getElementById('turnstile-status');
            if (input) input.value = token;
            if (status) status.innerText = 'Đã xác minh. Bạn có thể đặt đơn.';
        }

        function onTurnstileExpired() {
            const input = document.getElementById('turnstile-token');
            const status = document.getElementById('turnstile-status');
            if (input) input.value = '';
            if (status) status.innerText = 'Xác minh đã hết hạn, vui lòng thực hiện lại.';
        }

        async function submitOrder() {
            if (selectedServices.length === 0) return alert("Anh chọn ít nhất 1 dịch vụ nhé!");

            const turnstileTokenInput = document.getElementById('turnstile-token');
            const pickupAddressInput = document.getElementById('pickup-address');
            const noteInput = document.getElementById('order-note');

            const turnstileToken = (turnstileTokenInput?.value || '').trim();
            if (!turnstileToken) return alert("Vui lòng hoàn tất xác minh không phải robot trước khi đặt đơn!");
            const requestPayload = {
                customer_name: document.getElementById('cus-name').value,
                phone: document.getElementById('cus-phone').value,
                service_ids: selectedServices.map((s) => s.id).filter(Boolean),
                pickup_address: (pickupAddressInput?.value || '').trim() || undefined,
                note: (noteInput?.value || '').trim() || undefined,
                turnstile_token: turnstileToken,
                idempotency_key: crypto.randomUUID(),
            };

            try {
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestPayload),
                });
                const result = await response.json();
                if (!response.ok || !result.ok) {
                    throw new Error(result.message || 'Lỗi tạo đơn hàng');
                }

                document.getElementById('success-modal').style.display = 'flex';
            } catch (e) {
                alert("Lỗi gửi đơn hàng: " + e.message);
            }
        }

        // Hàm xử lý gửi tin nhắn thông báo qua API của Telegram
        async function sendTelegramNotification(order) {
            try {
                // Gọi tới API nội bộ (Cloudflare Function) để giấu kín Token
                const response = await fetch('/api/telegram', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(order)
                });
                
                if (!response.ok) {
                    throw new Error("API call failed with status " + response.status);
                }
                console.log("Thông báo đơn hàng mới đã được gửi qua API nội bộ an toàn.");
            } catch (err) {
                console.error("Lỗi khi gửi thông báo (có thể do đang chạy Local không có serverless):", err);
            }
        }
        function initSlideshow() {
            const slider = document.getElementById('slider');
            const images = ['Pic1.png', 'Pic2.png', 'Pic3.png', 'Pic4.png', 'Pic5.png', 'Pic6.png'];
            images.forEach((img, i) => {
                const div = document.createElement('div');
                div.className = `bg-slide ${i === 0 ? 'active' : ''}`;
                div.style.backgroundImage = `url('${img}')`;
                slider.appendChild(div);
            });
            let current = 0;
            setInterval(() => {
                const slides = document.querySelectorAll('.bg-slide');
                if(slides.length === 0) return;
                slides[current].classList.remove('active');
                current = (current + 1) % slides.length;
                slides[current].classList.add('active');
            }, 4000);
        }

        async function copyLandingLink() {
            const copyText = "https://3shoe.pages.dev/?page=order";
            try {
                await navigator.clipboard.writeText(copyText);
                alert("Đã sao chép link đặt hàng thành công!");
            } catch (err) {
                // Chế độ dự phòng cho trình duyệt cũ
                const tempInput = document.createElement("input");
                tempInput.value = copyText;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand("copy");
                document.body.removeChild(tempInput);
                alert("Đã sao chép link đặt hàng!");
            }
        }

        // -----------------------------------------------------
        // 3. ADMIN LOGIC
        // -----------------------------------------------------
        let chartBarInstance = null;
        let chartLineInstance = null;

        function switchTab(id) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.getElementById(id).classList.add('active');
            document.getElementById('btn-' + id).classList.add('active');
            if(id === 'dashboard') updateDashboard();
            if(id === 'orders') updateOrders();
            if(id === 'bookings') updateBookings(); // TẢI DANH SÁCH ĐẶT LỊCH LANDING PAGE
            if(id === 'finance') updateFinance();
            if(id === 'customers') updateCRM();
            if(id === 'payment') initPayment();
        }

        async function updateDashboard() {
            const { data: orders } = await supabaseClient.from('orders').select('*');
            const { data: costs } = await supabaseClient.from('costs').select('*');
            
            // Lọc ra các đơn hàng thực tế đã hoàn thành để tính toán doanh thu thực nhận
            const completedOrders = orders ? orders.filter(o => o.status === 'Đã hoàn thành') : [];
            const totalRev = completedOrders.reduce((a, b) => a + (b.total || 0), 0);
            const totalCost = costs ? costs.reduce((a, b) => a + b.amount, 0) : 0;
            
            // Tính toán Doanh thu Ngày hôm nay dựa trên ngày hiện tại
            const todayStr = new Date().toDateString();
            const todayRev = completedOrders
                .filter(o => new Date(o.created_at).toDateString() === todayStr)
                .reduce((a, b) => a + (b.total || 0), 0);

            document.getElementById('kpi-total').innerText = totalRev.toLocaleString() + ' ₫';
            document.getElementById('kpi-cost').innerText = totalCost.toLocaleString() + ' ₫';
            document.getElementById('kpi-profit').innerText = (totalRev - totalCost).toLocaleString() + ' ₫';
            document.getElementById('kpi-day').innerText = todayRev.toLocaleString() + ' ₫';
            
            // Tìm dịch vụ bán chạy
            const svcCount = {};
            completedOrders.forEach(o => {
                if(o.services) {
                    o.services.split(', ').forEach(s => {
                        // Trích xuất tên dịch vụ gốc phòng khi có thông tin số lượng như "(x2)"
                        const rawName = s.split(' (x')[0];
                        const countMatch = s.match(/\(x(\d+)\)/);
                        const count = countMatch ? parseInt(countMatch[1]) : 1;
                        svcCount[rawName] = (svcCount[rawName] || 0) + count;
                    });
                }
            });
            const sortedSvc = Object.entries(svcCount).sort((a,b) => b[1] - a[1]).slice(0, 5);
            document.getElementById('best-services').innerHTML = sortedSvc.map(([n, c]) => 
                `<li class="flex justify-between p-2 bg-white rounded-lg">${esc(n)} <span class="font-bold">${c} lần</span></li>`
            ).join('');

            // Khách hàng trung thành (Số lần sử dụng dịch vụ)
            const cusCount = {};
            completedOrders.forEach(o => { 
                if (o.customer_name) {
                    cusCount[o.customer_name] = (cusCount[o.customer_name] || 0) + 1; 
                }
            });
            const sortedCus = Object.entries(cusCount).sort((a,b) => b[1] - a[1]).slice(0, 5);
            document.getElementById('top-customers').innerHTML = sortedCus.map(([n, c]) => 
                `<li class="flex justify-between p-2 bg-white rounded-lg">${esc(n)} <span class="font-bold">${c} lần</span></li>`
            ).join('');

            initCharts(completedOrders, costs);
        }

        // QUẢN LÝ ĐƠN HÀNG (Chỉ những đơn đã check-out hoàn thành, không hiển thị 'Chờ thanh toán')
        async function updateOrders() {
            const { data: orders } = await supabaseClient.from('orders').select('*').neq('status', 'Chờ thanh toán').order('created_at', { ascending: false });
            const list = document.getElementById('order-list');
            if (!orders || orders.length === 0) {
                list.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-400 italic">Không có đơn hàng nào.</td></tr>`;
                return;
            }
            list.innerHTML = orders.map((o, i) => `
                <tr class="hover:bg-white/50 transition">
                    <td class="py-4 px-6 font-bold">${esc(o.customer_name)}<br><span class="text-xs text-slate-400">${esc(o.phone)}</span></td>
                    <td class="py-4 px-6 text-slate-600">${esc(o.services)}</td>
                    <td class="py-4 px-6">${new Date(o.created_at).toLocaleDateString('vi-VN')}</td>
                    <td class="py-4 px-6">
                        <span class="${o.status === 'Đã hoàn thành' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'} px-2 py-1 rounded-lg text-xs font-bold">
                            ${esc(o.status)}
                        </span>
                    </td>
                    <td class="py-4 px-6">
                        ${o.status === 'Chờ nhận đơn' ? 
                        `<button onclick="completeOrder('${esc(o.id)}')" class="bg-sky-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-sky-600 transition">Hoàn thành</button>` : 
                        `<i class="fa-solid fa-circle-check text-emerald-500"></i>`}
                    </td>
                </tr>
            `).join('');
        }

        // QUẢN LÝ THÔNG TIN ĐẶT LỊCH LANDING (Chỉ hiển thị trạng thái 'Chờ thanh toán')
        async function updateBookings() {
            const { data: bookings } = await supabaseClient.from('orders').select('*').eq('status', 'Chờ thanh toán').order('created_at', { ascending: false });
            const list = document.getElementById('booking-list');
            if (!bookings || bookings.length === 0) {
                list.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-400 italic">Không có lịch đặt mới từ Landing Page.</td></tr>`;
                return;
            }
            list.innerHTML = bookings.map(b => `
                <tr class="hover:bg-white/50 transition">
                    <td class="py-4 px-6 font-bold text-slate-700">${esc(b.customer_name)}</td>
                    <td class="py-4 px-6 font-mono">${esc(b.phone)}</td>
                    <td class="py-4 px-6 text-slate-600">${esc(b.services)}</td>
                    <td class="py-4 px-6">${new Date(b.created_at).toLocaleDateString('vi-VN')}</td>
                    <td class="py-4 px-6 text-center">
                        <button onclick="checkoutBooking('${esc(b.id)}', '${esc(b.customer_name).replace(/'/g, "\\'")}', '${esc(b.phone)}', '${esc(b.services).replace(/'/g, "\\'")}')" class="bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-sky-600 transition shadow-sm inline-flex items-center gap-1">
                            <i class="fa-solid fa-credit-card"></i> Thanh toán
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        // Chuyển hướng dữ liệu Đặt lịch sang Tab Thanh toán (POS) để check-out
        function checkoutBooking(id, name, phone, services) {
            pendingBookingId = id;
            
            // Chuyển sang Tab Thanh toán
            switchTab('payment');
            
            // Điền thông tin cơ bản
            document.getElementById('pay-name').value = name;
            document.getElementById('pay-phone').value = phone;
            
            // Reset số lượng dịch vụ POS về 0 trước khi nạp dữ liệu đặt lịch
            Object.keys(offlineSelected).forEach(key => {
                offlineSelected[key].qty = 0;
            });
            
            // Parse danh sách dịch vụ đặt và nạp vào POS
            const svcsArr = services.split(', ');
            svcsArr.forEach(s => {
                const rawName = s.split(' (x')[0].trim();
                const countMatch = s.match(/\(x(\d+)\)/);
                const count = countMatch ? parseInt(countMatch[1]) : 1;
                
                if (offlineSelected[rawName]) {
                    offlineSelected[rawName].qty = count;
                }
            });
            
            // Cập nhật lại giao diện hiển thị máy tính tiền
            initPayment(); 
        }

        async function completeOrder(id) {
            const { error } = await supabaseClient.from('orders').update({ status: 'Đã hoàn thành' }).eq('id', id);
            if(error) {
                alert("Lỗi cập nhật đơn hàng!");
            } else {
                updateOrders();
                updateDashboard();
                updateCRM();
            }
        }

        async function addCost() {
            const desc = document.getElementById('cost-desc').value;
            const val = parseInt(document.getElementById('cost-val').value);
            const type = document.getElementById('cost-type').value;
            if(!desc || !val) return alert("Điền đủ chi phí!");
            const { error } = await supabaseClient.from('costs').insert([{ description: desc, amount: val, type: type }]);
            if(error) alert("Lỗi ghi chi phí!");
            else updateFinance();
        }

        async function updateFinance() {
            const { data: costs } = await supabaseClient.from('costs').select('*').order('created_at', { ascending: false });
            const list = document.getElementById('cost-list');
            let total = 0;
            list.innerHTML = costs.map(c => {
                total += c.amount;
                return `<li class="flex justify-between p-3 bg-white/60 rounded-xl border border-white shadow-sm">
                    <span class="text-sm font-bold text-slate-700">${esc(c.description)} <small class="text-slate-400 ml-2">${esc(c.type)}</small></span>
                    <div class="text-right">
                        <span class="block text-rose-500 font-bold">-${c.amount.toLocaleString()} ₫</span>
                        <span class="text-[9px] text-slate-400">${new Date(c.created_at).toLocaleString('vi-VN')}</span>
                    </div>
                </li>`;
            }).join('');
            document.getElementById('total-cost-display').innerText = total.toLocaleString() + ' ₫';
        }

        async function updateCRM() {
            const { data: orders } = await supabaseClient.from('orders').select('*');
            const customers = {};
            
            if (orders) {
                orders.forEach(o => {
                    if (!o.phone) return;
                    if(!customers[o.phone]) {
                        customers[o.phone] = { name: o.customer_name, count: 0, total: 0 };
                    }
                    // Chỉ đồng bộ dữ liệu tần suất & doanh thu cho các đơn đã thực tế checkout hoàn thành
                    if (o.status === 'Đã hoàn thành') {
                        customers[o.phone].count++;
                        customers[o.phone].total += (o.total || 0);
                    }
                });
            }

            const list = document.getElementById('customer-list');
            list.innerHTML = Object.keys(customers).map(phone => `
                <tr class="border-b border-white hover:bg-white/50 transition">
                    <td class="py-4 px-6 font-bold">${esc(customers[phone].name)}</td>
                    <td class="py-4 px-6 font-mono">${esc(phone)}</td>
                    <td class="py-4 px-6">${customers[phone].count} lần</td>
                    <td class="py-4 px-6 text-yellow-500"><i class="fa-solid fa-star"></i> 5/5</td>
                    <td class="py-4 px-6 font-bold text-sky-600">${customers[phone].total.toLocaleString()} ₫</td>
                </tr>
            `).join('');
        }

        // -----------------------------------------------------
        // 4. MÁY TÍNH TIỀN OFFLINE & IN HÓA ĐƠN POS 58L
        // -----------------------------------------------------
        let offlineSelected = {}; 
        let activePaymentServices = typeof getPaymentServices === 'function' ? getPaymentServices() : [];

        // Reset trạng thái máy tính tiền khi bấm trực tiếp vào menu Thanh Toán
        function clearPOS() {
            pendingBookingId = null;
            document.getElementById('pay-name').value = '';
            document.getElementById('pay-phone').value = '';
            if(document.getElementById('discount-select')) document.getElementById('discount-select').value = '0';
            if(document.getElementById('custom-svc-name')) {
                document.getElementById('custom-svc-name').value = '';
                document.getElementById('custom-svc-price').value = '';
            }
            
            // Khôi phục danh sách dịch vụ mặc định
            activePaymentServices = typeof getPaymentServices === 'function' ? getPaymentServices() : [];
            offlineSelected = {};
            initPayment();
        }

        function initPayment() {
            activePaymentServices.forEach(s => {
                if (!offlineSelected[s.n]) {
                    offlineSelected[s.n] = { qty: 0, basePrice: s.p, isCustom: s.c, currentPrice: s.p };
                }
            });
            renderPaymentGrid();
            updatePayTotal();
        }

        function renderPaymentGrid() {
            const area = document.getElementById('pay-services');
            area.innerHTML = activePaymentServices.map(s => {
                const item = offlineSelected[s.n];
                const isCustom = s.c;
                // Hàm regex an toàn để đặt ID
                const safeId = s.n.replace(/[^a-zA-Z0-9]/g, '_');
                return `
                    <div class="flex flex-col p-3 bg-white/80 rounded-xl border border-white shadow-sm transition hover:border-sky-300">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-xs font-extrabold text-slate-700 leading-tight">${esc(s.n)}</span>
                            ${isCustom ? 
                                `<input type="number" id="price-input-${safeId}" placeholder="Giá thỏa thuận..." value="${item.currentPrice || ''}" oninput="updateOfflineCustomPrice('${s.n}', this.value)" class="w-24 text-right px-2 py-1 text-xs border border-sky-100 rounded-lg outline-none focus:ring-1 focus:ring-sky-500 font-bold text-sky-600" />`
                                : `<span class="text-xs font-black text-sky-600">${s.p.toLocaleString()}₫</span>`
                            }
                        </div>
                        <div class="flex justify-between items-center mt-auto pt-1 border-t border-slate-50/50">
                            <span class="text-[10px] font-bold text-slate-400">Số lượng:</span>
                            <div class="flex items-center gap-2">
                                <button type="button" onclick="changeQty('${s.n}', -1)" class="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">-</button>
                                <span id="qty-val-${safeId}" class="text-xs font-black w-4 text-center">${item.qty}</span>
                                <button type="button" onclick="changeQty('${s.n}', 1)" class="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">+</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function addCustomService() {
            const name = document.getElementById('custom-svc-name').value.trim();
            const price = parseInt(document.getElementById('custom-svc-price').value) || 0;
            if (!name || price <= 0) return alert("Vui lòng nhập tên dịch vụ và giá tiền hợp lệ!");
            
            let key = name;
            let counter = 1;
            while(offlineSelected[key]) {
                key = `${name} (${counter})`;
                counter++;
            }
            
            activePaymentServices.push({n: key, p: price, c: false});
            offlineSelected[key] = { qty: 1, basePrice: price, isCustom: false, currentPrice: price };
            
            document.getElementById('custom-svc-name').value = '';
            document.getElementById('custom-svc-price').value = '';
            renderPaymentGrid();
            updatePayTotal();
        }

        function updateOfflineCustomPrice(name, value) {
            const price = parseInt(value) || 0;
            if (offlineSelected[name]) {
                offlineSelected[name].currentPrice = price;
            }
            updatePayTotal();
        }

        function changeQty(name, amount) {
            if (offlineSelected[name]) {
                let newQty = offlineSelected[name].qty + amount;
                if (newQty < 0) newQty = 0;
                offlineSelected[name].qty = newQty;
                const safeId = name.replace(/[^a-zA-Z0-9]/g, '_');
                document.getElementById(`qty-val-${safeId}`).innerText = newQty;
            }
            updatePayTotal();
        }

        function updatePayTotal() {
            let total = 0;
            let items = [];
            
            Object.keys(offlineSelected).forEach(name => {
                const item = offlineSelected[name];
                if (item.qty > 0) {
                    const price = item.isCustom ? item.currentPrice : item.basePrice;
                    const subtotal = price * item.qty;
                    total += subtotal;
                    items.push({ name, qty: item.qty, price, subtotal });
                }
            });

            // Tính giảm giá
            const discountSelect = document.getElementById('discount-select');
            const discountPercent = discountSelect ? (parseInt(discountSelect.value) || 0) : 0;
            const discountAmount = Math.floor(total * (discountPercent / 100));
            const finalTotal = total - discountAmount;

            document.getElementById('pay-total').innerText = finalTotal.toLocaleString() + ' ₫';
            
            const infoEl = document.getElementById('discount-info');
            if (infoEl) {
                if (discountPercent > 0) {
                    infoEl.classList.remove('hidden');
                    document.getElementById('discount-amount').innerText = discountAmount.toLocaleString() + ' ₫';
                } else {
                    infoEl.classList.add('hidden');
                }
            }

            const preview = document.getElementById('preview-items');
            
            if (items.length === 0) {
                preview.innerHTML = `<p class="text-center text-slate-300 italic">Hãy chọn dịch vụ...</p>`;
                document.getElementById('preview-total').innerText = '0 ₫';
            } else {
                let html = items.map(it => `
                    <div class="flex justify-between text-[9px] gap-2">
                        <span class="truncate">${esc(it.name)} (x${it.qty})</span>
                        <span class="flex-shrink-0">${it.subtotal.toLocaleString()}₫</span>
                    </div>
                `).join('');
                
                if (discountPercent > 0) {
                    html += `
                    <div class="flex justify-between text-[9px] gap-2 mt-1 pt-1 border-t border-dashed">
                        <span class="truncate text-rose-500 font-bold">Giảm giá (${discountPercent}%)</span>
                        <span class="flex-shrink-0 text-rose-500 font-bold">-${discountAmount.toLocaleString()}₫</span>
                    </div>`;
                }
                
                preview.innerHTML = html;
                document.getElementById('preview-total').innerText = finalTotal.toLocaleString() + ' ₫';
            }
        }

        function generatePaymentQR() {
            const totalText = document.getElementById('pay-total').innerText;
            const totalVal = parseInt(totalText.replace(/\s/g, '').replace('₫', '').replace(/,/g, ''));
            if (!totalVal || totalVal === 0) return alert("Chọn dịch vụ để tính tiền!");
            
            // Xây dựng mã VietQR động theo các biến cấu hình đầu thẻ script
            const addInfo = encodeURIComponent(`THANH TOAN 3S`);
            const qrUrl = `https://img.vietqr.io/image/${BANK_BIN}-${BANK_ACCOUNT}-${BANK_TEMPLATE}.png?amount=${totalVal}&addInfo=${addInfo}&accountName=${encodeURIComponent(BANK_ACCOUNT_NAME)}`;
            
            document.getElementById('qr-img').src = qrUrl;
            document.getElementById('qr-area').classList.remove('hidden');
        }

        async function exportInvoice() {
            const finalTotalText = document.getElementById('pay-total').innerText;
            const finalTotalVal = parseInt(finalTotalText.replace(/\s/g, '').replace('₫', '').replace(/,/g, ''));
            if (!finalTotalVal || finalTotalVal === 0) return alert("Hãy chọn ít nhất một dịch vụ và tính tiền trước khi xuất hóa đơn!");
            
            const name = document.getElementById('pay-name').value.trim() || "Khách vãng lai";
            const phone = document.getElementById('pay-phone').value.trim() || "N/A";
            const discountPercent = parseInt(document.getElementById('discount-select') ? document.getElementById('discount-select').value : 0) || 0;
            
            const items = [];
            let rawTotal = 0;
            Object.keys(offlineSelected).forEach(name => {
                const item = offlineSelected[name];
                if (item.qty > 0) {
                    const price = item.isCustom ? item.currentPrice : item.basePrice;
                    rawTotal += price * item.qty;
                    items.push({ name, qty: item.qty, price, subtotal: price * item.qty });
                }
            });
            const discountAmount = Math.floor(rawTotal * (discountPercent / 100));

            // Tự động lưu giao dịch/đơn hàng với trạng thái Hoàn thành để cập nhật báo cáo và CRM
            const servicesStr = items.map(it => `${it.name} (x${it.qty})`).join(', ') + (discountPercent > 0 ? ` [Giảm ${discountPercent}%]` : '');
            const orderData = {
                customer_name: name,
                phone: phone,
                services: servicesStr,
                total: finalTotalVal,
                status: 'Đã hoàn thành',
                created_at: new Date().toISOString()
            };
            
            try {
                let error;
                if (pendingBookingId) {
                    const res = await supabaseClient.from('orders').update(orderData).eq('id', pendingBookingId);
                    error = res.error;
                    pendingBookingId = null; 
                } else {
                    const res = await supabaseClient.from('orders').insert([orderData]);
                    error = res.error;
                }
                if (error) throw error;
                console.log("Đơn hàng đã được đồng bộ hóa và lưu vào máy chủ.");
            } catch (e) {
                console.error("Lỗi đồng bộ:", e);
                alert("Cảnh báo: Lỗi kết nối mạng! Dữ liệu hóa đơn này chưa được lưu đồng bộ lên cơ sở dữ liệu.");
            }

            const invoiceNo = "HD-" + Math.floor(100000 + Math.random() * 900000);
            const dateStr = new Date().toLocaleString('vi-VN');

            // Xây dựng cấu trúc hóa đơn siêu tinh gọn chuẩn POS 58mm (Nghị định 123/2020/NĐ-CP)
            const invContent = `
                <div class="receipt-container">
                    <div class="header">
                        <img src="logo.png" class="logo" alt="Logo 3S">
                        <h2 class="store-name">3S SHOE CARE</h2>
                        <p class="store-info">Địa chỉ: P. Long Nguyên, TP. HCM</p>
                        <p class="store-info">Hotline: 0382.878.953</p>
                        <p class="store-info">MST: 8132456789</p>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="title-section">
                        <h3>HÓA ĐƠN DỊCH VỤ</h3>
                        <p class="invoice-meta">Số: ${invoiceNo}</p>
                        <p class="invoice-meta">Ngày: ${dateStr}</p>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="customer-info">
                        <p><strong>Khách hàng:</strong> ${name}</p>
                        <p><strong>SĐT:</strong> ${phone}</p>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th align="left">Dịch vụ (SL)</th>
                                <th align="right">T.Tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(it => `
                                <tr>
                                    <td>
                                        <div class="item-name">${it.name}</div>
                                        <div class="item-details">${it.qty} x ${it.price.toLocaleString()}₫</div>
                                    </td>
                                    <td align="right" valign="bottom">
                                        <strong>${it.subtotal.toLocaleString()}₫</strong>
                                    </td>
                                </tr>
                            `).join('')}
                            ${discountPercent > 0 ? `
                                <tr>
                                    <td>
                                        <div class="item-name" style="color: #444; font-weight: normal;">Giảm giá (${discountPercent}%)</div>
                                    </td>
                                    <td align="right" valign="bottom">
                                        <strong>-${discountAmount.toLocaleString()}₫</strong>
                                    </td>
                                </tr>
                            ` : ''}
                        </tbody>
                    </table>
                    
                    <div class="divider"></div>
                    
                    <div class="total-section">
                        <p class="total-row"><span>TỔNG THANH TOÁN:</span> <span class="total-val">${finalTotalVal.toLocaleString()} ₫</span></p>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="footer">
                        <p class="greeting">3S Shoe chân thành cảm ơn quý khách!</p>
                        <p class="greeting">Chúc quý khách một ngày tuyệt vời và luôn có những bước đi tự tin cùng đôi giày sạch đẹp!</p>
                        <p class="regulatory">Hóa đơn tính tiền dịch vụ</p>
                        <div style="height: 15px"></div>
                        <p class="signature"><i>(Chữ ký số xác thực hệ thống 3S)</i></p>
                    </div>
                </div>
            `;

            // Mở cửa sổ in ấn mới định dạng chuẩn 58mm cho máy in
            const printWindow = window.open('', '_blank', 'width=400,height=600');
            printWindow.document.write(`
                <html>
                <head>
                    <title>In hóa đơn 3S</title>
                    <style>
                        @page { margin: 0; size: 58mm auto; }
                        body {
                            width: 58mm; /* Đã tối ưu cho POS 58L */
                            margin: 0 auto;
                            padding: 2mm 3mm;
                            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; /* Font chuẩn không chân giúp in nhiệt rõ ràng */
                            color: #000;
                            background: #fff;
                            font-size: 11px; /* Kích thước tối ưu dễ đọc */
                            line-height: 1.3;
                            box-sizing: border-box;
                        }
                        .receipt-container { width: 100%; box-sizing: border-box; }
                        .header { text-align: center; margin-bottom: 4px; }
                        .logo {
                            width: 48px; /* Kích thước logo tối ưu */
                            height: auto;
                            display: block;
                            margin: 0 auto 5px auto;
                            filter: grayscale(100%) contrast(150%); /* Tăng độ tương phản để in rõ trên giấy nhiệt */
                        }
                        .store-name { font-size: 14px; font-weight: 900; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px; }
                        .store-info { font-size: 9px; margin: 2px 0; font-weight: bold; }
                        .divider { border-top: 1px dashed #000; margin: 6px 0; }
                        .title-section { text-align: center; }
                        .title-section h3 { font-size: 12px; font-weight: 900; margin: 0 0 4px 0; }
                        .invoice-meta { font-size: 9px; margin: 2px 0; font-family: 'Courier New', monospace; font-weight: bold; }
                        .customer-info p { margin: 3px 0; font-size: 10px; font-weight: bold; }
                        .items-table { width: 100%; border-collapse: collapse; font-size: 10px; }
                        .items-table th { border-bottom: 1px solid #000; padding-bottom: 4px; font-weight: 900; }
                        .items-table td { padding: 5px 0; border-bottom: 1px dotted #ccc; }
                        .item-name { font-weight: bold; line-height: 1.2; margin-bottom: 2px; }
                        .item-details { font-size: 9px; color: #333; }
                        .total-section { font-size: 11px; font-weight: 900; padding: 4px 0; }
                        .total-row { display: flex; justify-content: space-between; margin: 0; align-items: center; }
                        .total-val { font-size: 14px; }
                        .footer { text-align: center; font-size: 9px; padding-top: 4px; }
                        .greeting { margin: 4px 0; font-weight: bold; }
                        .regulatory { font-size: 8px; margin-top: 8px; color: #444; }
                        .signature { font-size: 8px; margin-top: 4px; }
                    </style>
                </head>
                <body onload="window.print(); window.close();">
                    ${invContent}
                </body>
                </html>
            `);
            printWindow.document.close();
            
            clearPOS();
        }

        // -----------------------------------------------------
        // 5. GRAPH CHUYÊN SÂU DỮ LIỆU THỰC TẾ
        // -----------------------------------------------------
        function initCharts(completedOrders, costs) {
            // Thiết lập dải thời gian hiển thị động: 6 tháng gần nhất tính tới thời điểm hiện tại
            const months = [];
            const revenueData = [];
            const costData = [];
            const profitData = [];

            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const year = d.getFullYear();
                const month = d.getMonth(); 
                const label = `Thg ${month + 1}`;
                months.push(label);

                // Tính tổng doanh thu của đơn hàng "Đã hoàn thành" trong tháng này
                const revInMonth = completedOrders.filter(o => {
                    const oDate = new Date(o.created_at);
                    return oDate.getFullYear() === year && oDate.getMonth() === month;
                }).reduce((sum, o) => sum + (o.total || 0), 0);
                
                // Tính tổng chi phí trong tháng này
                const costInMonth = (costs || []).filter(c => {
                    const cDate = new Date(c.created_at);
                    return cDate.getFullYear() === year && cDate.getMonth() === month;
                }).reduce((sum, c) => sum + (c.amount || 0), 0);

                revenueData.push(revInMonth);
                costData.push(costInMonth);
                profitData.push(revInMonth - costInMonth);
            }

            // Hủy thể hiện của biểu đồ cũ trước khi dựng biểu đồ mới để tránh chồng lấn
            if (chartBarInstance) chartBarInstance.destroy();
            if (chartLineInstance) chartLineInstance.destroy();

            const ctxBar = document.getElementById('chartBar').getContext('2d');
            chartBarInstance = new Chart(ctxBar, {
                type: 'bar',
                data: { 
                    labels: months, 
                    datasets: [
                        { label: 'Doanh Thu (đ)', data: revenueData, backgroundColor: '#0ea5e9', borderRadius: 6 }, 
                        { label: 'Chi Phí (đ)', data: costData, backgroundColor: '#f43f5e', borderRadius: 6 }
                    ] 
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) { return value.toLocaleString() + ' ₫'; }
                            }
                        }
                    }
                }
            });

            const ctxLine = document.getElementById('chartLine').getContext('2d');
            chartLineInstance = new Chart(ctxLine, {
                type: 'line',
                data: { 
                    labels: months, 
                    datasets: [{ 
                        label: 'Lợi Nhuận ròng (đ)', 
                        data: profitData, 
                        borderColor: '#10b981', 
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4 
                    }] 
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) { return value.toLocaleString() + ' ₫'; }
                            }
                        }
                    }
                }
            });
        }
