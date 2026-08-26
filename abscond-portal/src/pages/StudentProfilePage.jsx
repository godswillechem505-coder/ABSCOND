import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ApiClient } from "../auth/ApiClient";
import { useAuth } from "../auth/useAuth";

const documentMeta = {
  "o-level-result": {
    label: "O'Level Result",
    description: "WAEC/NECO Result",
  },
  "jamb-result": {
    label: "JAMB Result Slip",
    description: "JAMB Result",
  },
  "post-utme-result": {
    label: "Post-UTME Result",
    description: "ABSCONS Post-UTME Result",
  },
  "passport-photo": {
    label: "Passport Photograph",
    description: "Passport Photograph",
  },
  "admission-letter": {
    label: "Admission Letter",
    description: "Provisional Admission Letter",
  },
  "acceptance-letter": {
    label: "Acceptance Letter",
    description: "Acceptance of Admission",
  },
  "birth-certificate": {
    label: "Birth Certificate",
    description: "Birth Certificate or Declaration of Age",
  },
  "certificate-of-origin": {
    label: "Certificate of Origin",
    description: "State of Origin Certificate",
  },
  "medical-fitness": {
    label: "Medical Fitness",
    description: "Medical Fitness Certificate",
  },
  other: {
    label: "Other Document",
    description: "Student document",
  },
};

const statusMeta = {
  approved: {
    label: "Uploaded",
    className: "approved",
  },
  pending: {
    label: "Pending",
    className: "pending",
  },
  rejected: {
    label: "Rejected",
    className: "rejected",
  },
};

const emptyForm = {
  phone: "",
  address: "",
  emergencyFullName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
  emergencyEmail: "",
  emergencyAddress: "",
  kinFullName: "",
  kinRelationship: "",
  kinPhone: "",
  kinEmail: "",
  kinAddress: "",
  kinOccupation: "",
};

const formatFullName = (student) =>
  [student?.firstName, student?.middleName, student?.lastName]
    .filter(Boolean)
    .join(" ");

const formatDate = (value) => {
  if (!value) {
    return "Not provided";
  }

  const normalizedValue = String(value).length === 10 ? `${value}T00:00:00` : value;
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatGender = (value) => {
  if (!value) {
    return "Not provided";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatLevel = (value) => {
  if (!value) {
    return "Not provided";
  }

  return String(value).toLowerCase().includes("level") ? value : `${value} Level`;
};

const formatStatus = (value) => {
  if (!value) {
    return "Student";
  }

  return `${value.charAt(0).toUpperCase()}${value.slice(1)} Student`;
};

const formatFileSize = (value) => {
  if (!value) {
    return "";
  }

  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const getPrimaryContact = (student) =>
  student?.emergencyContacts?.find((contact) => contact.isPrimary) ||
  student?.emergencyContacts?.[0] ||
  {};

const getNextOfKin = (student) => student?.nextOfKin?.[0] || {};

const buildFormState = (student) => {
  const emergencyContact = getPrimaryContact(student);
  const nextOfKin = getNextOfKin(student);

  return {
    phone: student?.phone || "",
    address: student?.address || "",
    emergencyFullName: emergencyContact.fullName || "",
    emergencyRelationship: emergencyContact.relationship || "",
    emergencyPhone: emergencyContact.phone || "",
    emergencyEmail: emergencyContact.email || "",
    emergencyAddress: emergencyContact.address || "",
    kinFullName: nextOfKin.fullName || "",
    kinRelationship: nextOfKin.relationship || "",
    kinPhone: nextOfKin.phone || "",
    kinEmail: nextOfKin.email || "",
    kinAddress: nextOfKin.address || "",
    kinOccupation: nextOfKin.occupation || "",
  };
};

const buildPatchPayload = (form) => ({
  phone: form.phone.trim(),
  address: form.address.trim(),
  emergencyContacts: [
    {
      fullName: form.emergencyFullName.trim(),
      relationship: form.emergencyRelationship.trim(),
      phone: form.emergencyPhone.trim(),
      email: form.emergencyEmail.trim(),
      address: form.emergencyAddress.trim(),
      isPrimary: true,
    },
  ],
  nextOfKin: [
    {
      fullName: form.kinFullName.trim(),
      relationship: form.kinRelationship.trim(),
      phone: form.kinPhone.trim(),
      email: form.kinEmail.trim(),
      address: form.kinAddress.trim(),
      occupation: form.kinOccupation.trim(),
    },
  ],
});

function ProfileField({ label, value, children }) {
  return (
    <div className="profile-field">
      <span>{label}</span>
      {children || <b>{value || "Not provided"}</b>}
    </div>
  );
}

function TextInput({ label, value, onChange, required = false, as = "input" }) {
  const Component = as;

  return (
    <label className="profile-input-field">
      <span>{label}</span>
      <Component value={value} onChange={onChange} required={required} />
    </label>
  );
}

function InfoCard({ title, kicker, onEdit, children }) {
  return (
    <section className="profile-info-card">
      <header>
        <div className="profile-info-title">
          <span aria-hidden="true" className="profile-card-icon">
            {kicker}
          </span>
          <h2>{title}</h2>
        </div>
        {onEdit && (
          <button className="profile-link-button" type="button" onClick={onEdit}>
            Edit
          </button>
        )}
      </header>
      <div className="profile-field-list">{children}</div>
    </section>
  );
}

export default function StudentProfilePage() {
  const { user, getAccessToken, refreshAccessToken } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    type: "o-level-result",
    name: documentMeta["o-level-result"].label,
    file: null,
  });

  const fetchProfile = useCallback(async () => {
    try {
      const data = await ApiClient.get(
        "/students/me",
        {},
        getAccessToken,
        refreshAccessToken,
      );
      setProfile(data.student);
      setForm(buildFormState(data.student));
      setError(null);
    } catch (err) {
      setError(err.message || "Unable to load profile.");
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, refreshAccessToken]);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    document.title = "My Profile | ABSCONS One";
    // Profile data is external API state loaded after this route mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, [fetchProfile]);

  const student = useMemo(() => {
    const mergedStudent = {
      ...(user?.student || {}),
      ...(profile || {}),
    };

    return {
      ...mergedStudent,
      campus: profile?.campus || user?.student?.campus,
      programme: profile?.programme || user?.student?.programme,
    };
  }, [profile, user]);

  const fullName = formatFullName(student) || "Student";
  const email = user?.email || "student@abscons.edu.ng";
  const emergencyContact = getPrimaryContact(student);
  const nextOfKin = getNextOfKin(student);
  const documents = student?.documents || [];
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");

  const updateForm = (field) => (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: event.target.value,
    }));
  };

  const enterEditMode = () => {
    setNotice(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setForm(buildFormState(student));
    setNotice(null);
    setIsEditing(false);
  };

  const saveProfile = async () => {
    const requiredFields = [
      form.emergencyFullName,
      form.emergencyRelationship,
      form.emergencyPhone,
      form.kinFullName,
      form.kinRelationship,
      form.kinPhone,
    ];

    if (requiredFields.some((field) => !field.trim())) {
      setNotice({
        type: "error",
        message: "Please complete the required contact fields.",
      });
      return;
    }

    setIsSaving(true);
    setNotice(null);

    try {
      const data = await ApiClient.patch(
        "/students/me",
        buildPatchPayload(form),
        {},
        getAccessToken,
        refreshAccessToken,
      );
      setProfile(data.student);
      setForm(buildFormState(data.student));
      setIsEditing(false);
      setNotice({
        type: "success",
        message: "Profile updated successfully.",
      });
    } catch (err) {
      setNotice({
        type: "error",
        message: err.message || "Unable to save profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openUploadModal = () => {
    setNotice(null);
    setUploadForm({
      type: "o-level-result",
      name: documentMeta["o-level-result"].label,
      file: null,
    });
    setUploadOpen(true);
  };

  const updateUploadType = (event) => {
    const type = event.target.value;

    setUploadForm((currentForm) => ({
      ...currentForm,
      type,
      name: documentMeta[type]?.label || currentForm.name,
    }));
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!uploadForm.file) {
      setNotice({
        type: "error",
        message: "Please select a document file.",
      });
      return;
    }

    const file = uploadForm.file;
    const fileName = file.name;
    const safeFileName = fileName.replace(/\s+/g, "-").toLowerCase();

    setIsUploading(true);
    setNotice(null);

    try {
      const data = await ApiClient.post(
        "/students/documents",
        {
          type: uploadForm.type,
          name: uploadForm.name.trim() || documentMeta[uploadForm.type].label,
          fileUrl: `/documents/${Date.now()}-${safeFileName}`,
          fileName,
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
        },
        {},
        getAccessToken,
        refreshAccessToken,
      );

      setProfile((currentProfile) => ({
        ...currentProfile,
        documents: [data.document, ...(currentProfile?.documents || [])],
      }));
      setUploadOpen(false);
      setNotice({
        type: "success",
        message: "Document uploaded successfully.",
      });
    } catch (err) {
      setNotice({
        type: "error",
        message: err.message || "Unable to upload document.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteDocument = async (documentId) => {
    const shouldDelete = window.confirm("Delete this pending document?");

    if (!shouldDelete) {
      return;
    }

    setDeletingDocumentId(documentId);
    setNotice(null);

    try {
      await ApiClient.delete(
        `/students/documents/${documentId}`,
        {},
        getAccessToken,
        refreshAccessToken,
      );
      setProfile((currentProfile) => ({
        ...currentProfile,
        documents: (currentProfile?.documents || []).filter(
          (document) => document.id !== documentId,
        ),
      }));
      setNotice({
        type: "success",
        message: "Document deleted successfully.",
      });
    } catch (err) {
      setNotice({
        type: "error",
        message: err.message || "Unable to delete document.",
      });
    } finally {
      setDeletingDocumentId(null);
    }
  };

  if (isLoading) {
    return (
      <section className="profile-page">
        <div className="profile-loading">Loading profile...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="profile-page">
        <div className="profile-error" role="alert">
          <h1>My Profile</h1>
          <p>{error}</p>
          <button type="button" onClick={loadProfile}>
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <header className="profile-page-header">
        <div>
          <h1>My Profile</h1>
          <nav aria-label="Breadcrumb">
            <Link to="/portal">Dashboard</Link>
            <span>/</span>
            <span>My Profile</span>
          </nav>
        </div>

        <div className="profile-header-actions">
          {isEditing ? (
            <>
              <button
                className="profile-secondary-button"
                type="button"
                onClick={cancelEdit}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="profile-primary-button"
                type="button"
                onClick={saveProfile}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              className="profile-primary-button"
              type="button"
              onClick={enterEditMode}
            >
              Edit Profile
            </button>
          )}
        </div>
      </header>

      {notice && (
        <div className={`profile-notice ${notice.type}`} role="status">
          {notice.message}
        </div>
      )}

      <section className="student-profile-hero">
        <div className="student-avatar" aria-hidden="true">
          {initials || "ST"}
        </div>
        <div className="student-profile-summary">
          <div className="student-name-row">
            <h2>{fullName}</h2>
            <span className={`portal-status-badge ${student.status || ""}`}>
              {formatStatus(student.status)}
            </span>
          </div>
          <div className="student-summary-grid">
            <ProfileField label="Student ID" value={student.matricNumber} />
            <ProfileField label="Course" value={student.programme?.name} />
            <ProfileField label="Campus" value={student.campus?.name} />
            <ProfileField label="Level" value={formatLevel(student.level)} />
            <ProfileField label="Email" value={email} />
            <ProfileField label="Phone" value={student.phone} />
            <ProfileField label="Address" value={student.address} />
          </div>
        </div>
      </section>

      <div className="profile-info-grid">
        <InfoCard title="Personal Information" kicker="PI" onEdit={enterEditMode}>
          <ProfileField label="Full Name" value={fullName} />
          <ProfileField label="Date of Birth" value={formatDate(student.dateOfBirth)} />
          <ProfileField label="Gender" value={formatGender(student.gender)} />
          {isEditing ? (
            <>
              <TextInput
                label="Phone Number"
                value={form.phone}
                onChange={updateForm("phone")}
              />
              <TextInput
                label="Residential Address"
                value={form.address}
                onChange={updateForm("address")}
                as="textarea"
              />
            </>
          ) : (
            <>
              <ProfileField label="Phone Number" value={student.phone} />
              <ProfileField label="Residential Address" value={student.address} />
            </>
          )}
          <ProfileField label="Email Address" value={email} />
        </InfoCard>

        <InfoCard title="Academic Information" kicker="AI">
          <ProfileField label="Student ID" value={student.matricNumber} />
          <ProfileField label="Programme" value={student.programme?.name} />
          <ProfileField label="Campus" value={student.campus?.name} />
          <ProfileField label="Level" value={formatLevel(student.level)} />
          <ProfileField label="Admission Year" value={student.admissionYear} />
          <ProfileField label="Current Session" value={student.currentSession} />
        </InfoCard>

        <InfoCard title="Emergency Contact" kicker="EC" onEdit={enterEditMode}>
          {isEditing ? (
            <>
              <TextInput
                label="Name"
                value={form.emergencyFullName}
                onChange={updateForm("emergencyFullName")}
                required
              />
              <TextInput
                label="Relationship"
                value={form.emergencyRelationship}
                onChange={updateForm("emergencyRelationship")}
                required
              />
              <TextInput
                label="Phone Number"
                value={form.emergencyPhone}
                onChange={updateForm("emergencyPhone")}
                required
              />
              <TextInput
                label="Email Address"
                value={form.emergencyEmail}
                onChange={updateForm("emergencyEmail")}
              />
              <TextInput
                label="Address"
                value={form.emergencyAddress}
                onChange={updateForm("emergencyAddress")}
                as="textarea"
              />
            </>
          ) : (
            <>
              <ProfileField label="Name" value={emergencyContact.fullName} />
              <ProfileField
                label="Relationship"
                value={emergencyContact.relationship}
              />
              <ProfileField label="Phone Number" value={emergencyContact.phone} />
              <ProfileField label="Email Address" value={emergencyContact.email} />
              <ProfileField label="Address" value={emergencyContact.address} />
            </>
          )}
        </InfoCard>

        <InfoCard title="Next of Kin" kicker="NK" onEdit={enterEditMode}>
          {isEditing ? (
            <>
              <TextInput
                label="Name"
                value={form.kinFullName}
                onChange={updateForm("kinFullName")}
                required
              />
              <TextInput
                label="Relationship"
                value={form.kinRelationship}
                onChange={updateForm("kinRelationship")}
                required
              />
              <TextInput
                label="Phone Number"
                value={form.kinPhone}
                onChange={updateForm("kinPhone")}
                required
              />
              <TextInput
                label="Email Address"
                value={form.kinEmail}
                onChange={updateForm("kinEmail")}
              />
              <TextInput
                label="Occupation"
                value={form.kinOccupation}
                onChange={updateForm("kinOccupation")}
              />
              <TextInput
                label="Address"
                value={form.kinAddress}
                onChange={updateForm("kinAddress")}
                as="textarea"
              />
            </>
          ) : (
            <>
              <ProfileField label="Name" value={nextOfKin.fullName} />
              <ProfileField label="Relationship" value={nextOfKin.relationship} />
              <ProfileField label="Phone Number" value={nextOfKin.phone} />
              <ProfileField label="Email Address" value={nextOfKin.email} />
              <ProfileField label="Occupation" value={nextOfKin.occupation} />
              <ProfileField label="Address" value={nextOfKin.address} />
            </>
          )}
        </InfoCard>
      </div>

      <section className="documents-panel">
        <header className="documents-panel-header">
          <div>
            <span className="documents-icon" aria-hidden="true">
              DC
            </span>
            <div>
              <h2>Documents & Credentials</h2>
              <p>Documents uploaded to the student portal.</p>
            </div>
          </div>
          <button
            className="profile-secondary-button upload-document-button"
            type="button"
            onClick={openUploadModal}
          >
            Upload New Document
          </button>
        </header>

        <div className="profile-table-wrap">
          <table className="documents-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Description</th>
                <th>Status</th>
                <th>Date Uploaded</th>
                <th>File Size</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.length > 0 ? (
                documents.map((document) => {
                  const meta = documentMeta[document.type] || documentMeta.other;
                  const status = statusMeta[document.status] || statusMeta.pending;

                  return (
                    <tr key={document.id}>
                      <td>
                        <div className="document-name-cell">
                          <span aria-hidden="true">DOC</span>
                          <b>{document.name || meta.label}</b>
                        </div>
                      </td>
                      <td>{meta.description}</td>
                      <td>
                        <span className={`document-status ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td>{formatDate(document.uploadedAt)}</td>
                      <td>{formatFileSize(document.fileSize) || "N/A"}</td>
                      <td>
                        <div className="document-actions">
                          <a
                            className="document-action view"
                            href={document.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </a>
                          <a
                            className="document-action download"
                            href={document.fileUrl}
                            download={document.fileName}
                          >
                            Download
                          </a>
                          {document.status === "pending" && (
                            <button
                              className="document-delete"
                              type="button"
                              onClick={() => deleteDocument(document.id)}
                              disabled={deletingDocumentId === document.id}
                            >
                              {deletingDocumentId === document.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="documents-empty">
                    No documents uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {uploadOpen && (
        <div className="profile-modal-backdrop" role="presentation">
          <section
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-document-title"
          >
            <header>
              <h2 id="upload-document-title">Upload Document</h2>
              <button
                type="button"
                aria-label="Close upload dialog"
                onClick={() => setUploadOpen(false)}
              >
                X
              </button>
            </header>

            <form className="profile-upload-form" onSubmit={handleUpload}>
              <label>
                Document Type
                <select value={uploadForm.type} onChange={updateUploadType}>
                  {Object.entries(documentMeta).map(([type, meta]) => (
                    <option value={type} key={type}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Display Name
                <input
                  value={uploadForm.name}
                  onChange={(event) =>
                    setUploadForm((currentForm) => ({
                      ...currentForm,
                      name: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label>
                File
                <input
                  type="file"
                  onChange={(event) =>
                    setUploadForm((currentForm) => ({
                      ...currentForm,
                      file: event.target.files?.[0] || null,
                    }))
                  }
                  required
                />
              </label>

              <div className="profile-modal-actions">
                <button
                  className="profile-secondary-button"
                  type="button"
                  onClick={() => setUploadOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  className="profile-primary-button"
                  type="submit"
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload Document"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
