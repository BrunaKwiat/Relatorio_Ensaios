
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reportForm');
    const generateBtn = document.getElementById('generateReport');
    const printBtn = document.getElementById('printReport');
    const reportOutput = document.getElementById('reportOutput');

    // Auto-fill current date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('issueDate').value = today;

    // Generate report functionality
    generateBtn.addEventListener('click', function() {
        if (validateForm()) {
            generateReport();
            reportOutput.style.display = 'block';
            reportOutput.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Print functionality
    printBtn.addEventListener('click', function() {
        if (reportOutput.style.display !== 'none') {
            window.print();
        } else {
            alert('Por favor, gere o relatório primeiro antes de imprimir.');
        }
    });

    // Auto-update conclusion based on test results
    const complianceSelects = document.querySelectorAll('select[name^="compliance"]');
    complianceSelects.forEach(select => {
        select.addEventListener('change', updateFinalConclusion);
    });

    function validateForm() {
        const requiredFields = [
            'reportNumber', 'revision', 'issueDate', 'technicalResponsible', 
            'laboratory', 'description', 'type', 'nominalDimension', 'color',
            'manufacturingProcess', 'brand', 'sampleNumber', 'sampleQuantity'
        ];

        for (let fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                alert(`Por favor, preencha o campo: ${field.previousElementSibling ? field.previousElementSibling.textContent : fieldId}`);
                field.focus();
                return false;
            }
        }

        // Check if at least one test result is filled
        let hasResults = false;
        for (let i = 1; i <= 7; i++) {
            const result = document.querySelector(`input[name="result${i}"]`);
            const requirement = document.querySelector(`input[name="requirement${i}"]`);
            const compliance = document.querySelector(`select[name="compliance${i}"]`);
            
            if (result.value.trim() || requirement.value.trim() || compliance.value) {
                hasResults = true;
                break;
            }
        }

        if (!hasResults) {
            alert('Por favor, preencha pelo menos um resultado de ensaio.');
            return false;
        }

        return true;
    }

    function updateFinalConclusion() {
        const complianceValues = [];
        complianceSelects.forEach(select => {
            if (select.value) {
                complianceValues.push(select.value);
            }
        });

        if (complianceValues.length > 0) {
            const hasNonCompliant = complianceValues.includes('Não Conforme');
            const conclusionRadio = hasNonCompliant ? 
                document.getElementById('naoConforme') : 
                document.getElementById('conforme');
            
            conclusionRadio.checked = true;
        }
    }

    function generateReport() {
        const data = collectFormData();
        const reportHTML = generateReportHTML(data);
        reportOutput.innerHTML = reportHTML;
    }

    function collectFormData() {
        const data = {};
        
        // Basic information
        data.reportNumber = document.getElementById('reportNumber').value;
        data.revision = document.getElementById('revision').value;
        data.issueDate = formatDate(document.getElementById('issueDate').value);
        data.technicalResponsible = document.getElementById('technicalResponsible').value;
        data.laboratory = document.getElementById('laboratory').value;
        data.referenceNorms = document.getElementById('referenceNorms').value;

        // Sample identification
        data.description = document.getElementById('description').value;
        data.type = document.getElementById('type').value;
        data.nominalDimension = document.getElementById('nominalDimension').value;
        data.color = document.getElementById('color').value;
        data.manufacturingProcess = document.getElementById('manufacturingProcess').value;
        data.brand = document.getElementById('brand').value;
        data.sampleNumber = document.getElementById('sampleNumber').value;
        data.sampleQuantity = document.getElementById('sampleQuantity').value;

        // Test results
        data.testResults = [];
        const testNames = [
            'Efeito sobre a água (Inocuidade) – ABNT NBR 8219',
            'Temperatura de amolecimento Vicat – ABNT NBR NM 82',
            'Presença de chumbo – EN 62321-3-1:2014',
            'Teor de cinzas – ABNT NBR NM 84',
            'Resistência à pressão hidrostática interna – ABNT NBR 8218',
            'Características geométricas – ABNT NBR 14264',
            'Desempenho da junta soldável – ABNT NBR 7371'
        ];

        for (let i = 1; i <= 7; i++) {
            const result = document.querySelector(`input[name="result${i}"]`).value;
            const requirement = document.querySelector(`input[name="requirement${i}"]`).value;
            const compliance = document.querySelector(`select[name="compliance${i}"]`).value;

            if (result || requirement || compliance) {
                data.testResults.push({
                    test: testNames[i-1],
                    result: result,
                    requirement: requirement,
                    compliance: compliance
                });
            }
        }

        // Discussion and conclusion
        data.resultsDiscussion = document.getElementById('resultsDiscussion').value;
        data.finalConclusion = document.querySelector('input[name="finalConclusion"]:checked')?.value || '';

        // Attachments
        data.attachments = [];
        if (document.getElementById('calibrationCerts').checked) {
            data.attachments.push('Certificados de calibração dos equipamentos');
        }
        if (document.getElementById('testSheets').checked) {
            data.attachments.push('Planilhas e gráficos dos ensaios');
        }
        if (document.getElementById('samplePhotos').checked) {
            data.attachments.push('Fotografias das amostras');
        }

        return data;
    }

    function generateReportHTML(data) {
        const conclusionClass = data.finalConclusion === 'Conforme' ? 'status-conforme' : 'status-nao-conforme';
        
        let testsHTML = '';
        data.testResults.forEach(test => {
            const complianceClass = test.compliance === 'Conforme' ? 'status-conforme' : 'status-nao-conforme';
            testsHTML += `
                <tr>
                    <td>${test.test}</td>
                    <td>${test.result}</td>
                    <td>${test.requirement}</td>
                    <td class="${complianceClass}">${test.compliance}</td>
                </tr>
            `;
        });

        let attachmentsHTML = '';
        if (data.attachments.length > 0) {
            attachmentsHTML = '<ul>';
            data.attachments.forEach(attachment => {
                attachmentsHTML += `<li>${attachment}</li>`;
            });
            attachmentsHTML += '</ul>';
        } else {
            attachmentsHTML = '<p>Nenhum anexo selecionado.</p>';
        }

        return `
            <h2>RELATÓRIO DE ENSAIOS – CONEXÕES DE PVC-U</h2>
            
            <section style="margin-bottom: 20px;">
                <h3>1. Identificação do Relatório</h3>
                <p><strong>Número do Relatório:</strong> ${data.reportNumber}</p>
                <p><strong>Revisão:</strong> ${data.revision}</p>
                <p><strong>Data de emissão:</strong> ${data.issueDate}</p>
                <p><strong>Responsável Técnico:</strong> ${data.technicalResponsible}</p>
                <p><strong>Laboratório:</strong> ${data.laboratory}</p>
                <p><strong>Normas de referência:</strong> ${data.referenceNorms}</p>
            </section>

            <section style="margin-bottom: 20px;">
                <h3>2. Identificação da Amostra</h3>
                <p><strong>Descrição:</strong> ${data.description}</p>
                <p><strong>Tipo:</strong> ${data.type}</p>
                <p><strong>Dimensão nominal:</strong> ${data.nominalDimension}</p>
                <p><strong>Cor:</strong> ${data.color}</p>
                <p><strong>Processo de fabricação:</strong> ${data.manufacturingProcess}</p>
                <p><strong>Marca:</strong> ${data.brand}</p>
                <p><strong>Lote/Número da amostra:</strong> ${data.sampleNumber}</p>
                <p><strong>Quantidade de amostras:</strong> ${data.sampleQuantity}</p>
            </section>

            <section style="margin-bottom: 20px;">
                <h3>3. Objetivo do Ensaio</h3>
                <p>O presente relatório tem por objetivo apresentar os resultados obtidos nos ensaios realizados em conexões de PVC-U, visando verificar a conformidade com os requisitos das normas técnicas aplicáveis.</p>
            </section>

            <section style="margin-bottom: 20px;">
                <h3>4. Métodos e Materiais Empregados</h3>
                <ul>
                    <li>Efeito sobre a água (Inocuidade) – ABNT NBR 8219</li>
                    <li>Temperatura de amolecimento Vicat – ABNT NBR NM 82</li>
                    <li>Presença de chumbo – EN 62321-3-1:2014</li>
                    <li>Teor de cinzas – ABNT NBR NM 84</li>
                    <li>Resistência à pressão hidrostática interna – ABNT NBR 8218</li>
                    <li>Características geométricas – ABNT NBR 14264</li>
                    <li>Desempenho da junta soldável – ABNT NBR 7371 (quando aplicável)</li>
                </ul>
            </section>

            <section style="margin-bottom: 20px;">
                <h3>5. Resultados dos Ensaios</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                    <thead>
                        <tr style="background-color: #3498db; color: white;">
                            <th style="border: 1px solid #ddd; padding: 8px;">Ensaio</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Resultado obtido</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Requisito normativo</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Conformidade</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${testsHTML}
                    </tbody>
                </table>
            </section>

            ${data.resultsDiscussion ? `
            <section style="margin-bottom: 20px;">
                <h3>6. Discussão dos Resultados</h3>
                <p>${data.resultsDiscussion}</p>
            </section>
            ` : ''}

            <section style="margin-bottom: 20px;">
                <h3>7. Conclusão</h3>
                <p>Com base nos resultados obtidos, conclui-se que a amostra está <span class="${conclusionClass}">${data.finalConclusion}</span> com as normas de referência.</p>
            </section>

            <section style="margin-bottom: 20px;">
                <h3>8. Anexos</h3>
                ${attachmentsHTML}
            </section>

            <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
                <p>Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}</p>
            </div>
        `;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    // Form reset confirmation
    form.addEventListener('reset', function(e) {
        if (!confirm('Tem certeza que deseja limpar todos os dados do formulário?')) {
            e.preventDefault();
        } else {
            reportOutput.style.display = 'none';
        }
    });

    // Save form data to localStorage
    function saveFormData() {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        localStorage.setItem('pvcReportFormData', JSON.stringify(data));
    }

    // Load form data from localStorage
    function loadFormData() {
        const savedData = localStorage.getItem('pvcReportFormData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                for (let [key, value] of Object.entries(data)) {
                    const element = document.querySelector(`[name="${key}"], #${key}`);
                    if (element) {
                        if (element.type === 'checkbox' || element.type === 'radio') {
                            element.checked = value === 'on' || value === element.value;
                        } else {
                            element.value = value;
                        }
                    }
                }
            } catch (e) {
                console.error('Error loading saved form data:', e);
            }
        }
    }

    // Auto-save form data
    form.addEventListener('input', saveFormData);
    form.addEventListener('change', saveFormData);

    // Load saved data on page load
    loadFormData();
});
