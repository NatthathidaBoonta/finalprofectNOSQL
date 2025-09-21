import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import theme from '../../utils/theme';

function ReportScreen() {
  const { auth } = useContext(AuthContext);
  const [roomNumber, setRoomNumber] = useState('');
  const [facility, setFacility] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Determine reportId from URL query string (web). Guard for non-browser env.
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const reportId = params ? params.get('id') : null;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // handle file select
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // If on web or navigated with a report id, try to fetch that report and show details
  useEffect(() => {
    if (!reportId) return;

    const fetchReport = async () => {
      setLoadingReport(true);
      try {
        const res = await fetch(`http://localhost:5001/api/reports/${reportId}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลรีพอร์ตได้');
        const data = await res.json();
        setReport(data);
      } catch (err) {
        setReport(null);
      } finally {
        setLoadingReport(false);
      }
    };

    fetchReport();
  }, [auth.token]);

  // Auto-fill room number from authenticated user (if available)
  useEffect(() => {
    if (auth && auth.user && auth.user.room_number) {
      setRoomNumber(auth.user.room_number);
    }
  }, [auth.user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!roomNumber || !facility || !description) {
      setMessage('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    setLoading(true);
    setMessage('');

    // FormData
    const formData = new FormData();
    formData.append('room_number', roomNumber);
    formData.append('facility', facility);
    formData.append('description', description);
    // อาจใส่ user_id ถ้ามีระบบ login
    if (image) {
      formData.append('image', image);
    }

    try {
      const res = await fetch('http://localhost:5001/api/report', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('ส่งข้อมูลแจ้งสำเร็จ');
        // reset form
        setRoomNumber('');
        setFacility('');
        setDescription('');
        setImage(null);
      } else {
        setMessage(data.message || 'ส่งข้อมูลไม่สำเร็จ');
      }
    } catch (error) {
      setMessage('ส่งข้อมูลไม่สำเร็จ: ' + error.message);
    }
    setLoading(false);
  };
  const getUserLabel = (r) => {
    if (!r) return '-';
    const u = r.user || r.user_id;
    if (!u) return '-';
    if (typeof u === 'object') {
      return u.name || u.username || (u._id ? String(u._id) : JSON.stringify(u));
    }
    return String(u);
  };

  return (
    <div style={{ background: theme.background, minHeight: '100vh', padding: 20 }}>
      <div style={{maxWidth: 720, margin: 'auto', padding: 20, background: theme.card, borderRadius: 8}}>
      {reportId || report ? (
        // Show report detail
        loadingReport ? (
          <div>Loading...</div>
        ) : report ? (
          <div>
            <h2 style={{color: theme.primary}}>รายละเอียดรีพอร์ต</h2>
            <p><strong>user_id:</strong> {String(getUserLabel(report))}</p>
            <p><strong>room_number:</strong> {report.room_number}</p>
            <p><strong>facility:</strong> {report.facility}</p>
            <p><strong>description:</strong> {report.description}</p>
            <p><strong>image_url:</strong> {report.image_url ? (
              (() => {
                const isRel = report.image_url.startsWith('/uploads');
                const src = isRel ? `http://localhost:5001${report.image_url}` : report.image_url;
                return (<a href={src} target="_blank" rel="noreferrer">ดูรูปภาพ</a>);
              })()
            ) : 'ไม่มี'}</p>
            <p><strong>status:</strong> {report.status}</p>
            <p><strong>created_at:</strong> {new Date(report.created_at).toLocaleString()}</p>
            <p><strong>updated_at:</strong> {new Date(report.updated_at).toLocaleString()}</p>
          </div>
        ) : (
          <div style={{color: theme.muted}}>ไม่พบรีพอร์ตนี้</div>
        )
        ) : (
        <>
          <h2 style={{color: theme.primary}}>แจ้งซ่อม/แจ้งปัญหา</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>เลขห้อง</label>
              <input
                type="text"
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                required
                style={{width: '100%', marginBottom: 10}}
                readOnly={!!(auth && auth.user && auth.user.room_number)}
              />
            </div>
            <div>
              <label>อุปกรณ์ที่พบปัญหา</label>
              <input
                type="text"
                value={facility}
                onChange={e => setFacility(e.target.value)}
                required
                style={{width: '100%', marginBottom: 10}}
              />
            </div>
            <div>
              <label>รายละเอียดปัญหา</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                style={{width: '100%', marginBottom: 10}}
              />
            </div>
            <div>
              <label>อัพโหลดรูปภาพ (ถ้ามี)</label><br/>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {image && <div style={{marginTop: 5}}>ไฟล์ที่เลือก: {image.name}</div>}
            </div>
            <button type="submit" disabled={loading} style={{width: '100%', marginTop: 20, background: theme.primary, color: '#fff', padding: 10, border: 0, borderRadius: 5}}>
              {loading ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลแจ้งขำรุด'}
            </button>
            {message && <div style={{marginTop: 15, color: message.includes('สำเร็จ') ? 'green' : 'red'}}>{message}</div>}
          </form>
        </>
      )}
      </div>
    </div>
  );
}

export default ReportScreen;