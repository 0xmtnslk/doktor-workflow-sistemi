import { useEffect, useState } from 'react';
import { getContractTimeline } from '../api';

interface TimelineStep {
  id: string;
  name: string;
  order: number;
  parallel: boolean;
  parallelGroup?: string;
  status: 'COMPLETED' | 'PENDING' | 'WAITING';
  completedBy: string | null;
  completedAt: string | null;
  assignedTo: string | null;
}

interface ContractInfo {
  id: number;
  doctor_name: string;
  doctor_role: string;
  current_status: string;
  created_by: string;
  created_at: string;
}

interface Props {
  contractId: number;
  onClose: () => void;
}

const ContractTimeline = ({ contractId, onClose }: Props) => {
  const [contract, setContract] = useState<ContractInfo | null>(null);
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
    const interval = setInterval(loadTimeline, 5000);
    return () => clearInterval(interval);
  }, [contractId]);

  const loadTimeline = async () => {
    try {
      const res = await getContractTimeline(contractId);
      setContract(res.data.contract);
      setTimeline(res.data.timeline);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#10b981';
      case 'PENDING': return '#f59e0b';
      default: return '#e2e8f0';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#d1fae5';
      case 'PENDING': return '#fef3c7';
      default: return '#f1f5f9';
    }
  };

  const groupedSteps = timeline.reduce((acc, step) => {
    const existingGroup = acc.find(g => g.order === step.order);
    if (existingGroup) {
      existingGroup.steps.push(step);
    } else {
      acc.push({ order: step.order, steps: [step], parallel: step.parallel });
    }
    return acc;
  }, [] as { order: number; steps: TimelineStep[]; parallel: boolean }[]);

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Süreç Takibi</h3>
            {contract && (
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '4px' }}>
                {contract.doctor_name} - {contract.doctor_role}
              </p>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {contract && (
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            borderRadius: '12px', 
            padding: '20px', 
            marginBottom: '24px',
            color: 'white'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Mevcut Durum</div>
                <div style={{ fontWeight: '600', fontSize: '1rem' }}>{contract.current_status}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Başlatan</div>
                <div style={{ fontWeight: '600', fontSize: '1rem' }}>{contract.created_by}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Başlangıç</div>
                <div style={{ fontWeight: '600', fontSize: '1rem' }}>{formatDate(contract.created_at)}</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ position: 'relative' }}>
          {groupedSteps.map((group, groupIndex) => (
            <div key={group.order} style={{ marginBottom: '8px' }}>
              {group.steps.length > 1 ? (
                <div style={{ display: 'flex', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '20px',
                    top: '0',
                    bottom: '0',
                    width: '2px',
                    background: groupIndex < groupedSteps.length - 1 ? '#e2e8f0' : 'transparent'
                  }} />
                  
                  <div style={{ 
                    width: '40px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: group.steps.every(s => s.status === 'COMPLETED') ? '#10b981' : 
                                 group.steps.some(s => s.status === 'PENDING') ? '#f59e0b' : '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {group.steps.every(s => s.status === 'COMPLETED') ? '✓' : group.order}
                    </div>
                  </div>

                  <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    gap: '12px',
                    position: 'relative',
                    paddingLeft: '20px'
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: '0',
                      top: '50%',
                      width: '20px',
                      height: '2px',
                      background: '#e2e8f0'
                    }} />
                    
                    {group.steps.map((step, idx) => (
                      <div key={step.id} style={{ position: 'relative', flex: 1 }}>
                        {idx === 0 && (
                          <div style={{
                            position: 'absolute',
                            left: '-20px',
                            top: '50%',
                            width: '20px',
                            height: '2px',
                            background: '#e2e8f0'
                          }} />
                        )}
                        
                        <div style={{
                          background: getStatusBg(step.status),
                          borderRadius: '12px',
                          padding: '16px',
                          borderLeft: `4px solid ${getStatusColor(step.status)}`
                        }}>
                          <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '0.9rem' }}>{step.name}</div>
                          {step.status === 'COMPLETED' && step.completedBy && (
                            <div style={{ fontSize: '0.8rem', color: '#047857' }}>
                              ✓ {step.completedBy}
                              <br />
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDate(step.completedAt!)}</span>
                            </div>
                          )}
                          {step.status === 'PENDING' && step.assignedTo && (
                            <div style={{ fontSize: '0.8rem', color: '#b45309' }}>
                              ⏳ Bekliyor: {step.assignedTo}
                            </div>
                          )}
                          {step.status === 'WAITING' && (
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Henüz başlamadı</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '20px',
                    top: '0',
                    bottom: '0',
                    width: '2px',
                    background: groupIndex < groupedSteps.length - 1 ? '#e2e8f0' : 'transparent'
                  }} />
                  
                  <div style={{ 
                    width: '40px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: getStatusColor(group.steps[0].status),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {group.steps[0].status === 'COMPLETED' ? '✓' : group.order}
                    </div>
                  </div>

                  <div style={{ 
                    flex: 1,
                    background: getStatusBg(group.steps[0].status),
                    borderRadius: '12px',
                    padding: '16px',
                    marginLeft: '12px',
                    borderLeft: `4px solid ${getStatusColor(group.steps[0].status)}`
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '0.9rem' }}>{group.steps[0].name}</div>
                    {group.steps[0].status === 'COMPLETED' && group.steps[0].completedBy && (
                      <div style={{ fontSize: '0.8rem', color: '#047857' }}>
                        ✓ Tamamlayan: {group.steps[0].completedBy}
                        <br />
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDate(group.steps[0].completedAt!)}</span>
                      </div>
                    )}
                    {group.steps[0].status === 'PENDING' && group.steps[0].assignedTo && (
                      <div style={{ fontSize: '0.8rem', color: '#b45309' }}>
                        ⏳ Bekliyor: {group.steps[0].assignedTo}
                      </div>
                    )}
                    {group.steps[0].status === 'WAITING' && (
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Henüz başlamadı</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Kapat</button>
        </div>
      </div>
    </div>
  );
};

export default ContractTimeline;
