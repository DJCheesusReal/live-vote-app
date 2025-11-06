"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const fetcher = (url) => fetch(url).then((res) => res.json());

const ContestantCard = ({ id, name, imgSrc, onVote, disabled = false }) => (
  <div
    className="contestant-card"
    onClick={() => !disabled && onVote(id)}
    style={{ cursor: disabled ? "default" : "pointer" }}
  >
    <img src={imgSrc} alt={`${name} Logo`} />
    <p className="name">{name}</p>
  </div>
);

const VoteChart = ({ voteData }) => {
  const data = {
    labels: ["Live Votes"],
    datasets: [
      {
        label: "dj_cheesuslive",
        data: [voteData.dj_cheesuslive],
        backgroundColor: "rgba(255, 206, 86, 0.7)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 1,
      },
      {
        label: "chillyplayzwastaken",
        data: [voteData.chillyplayzwastaken],
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };
  const options = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "white", font: { size: 14 } },
      },
    },
    scales: {
      x: {
        ticks: { color: "white", stepSize: 1, font: { size: 12 } },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        ticks: { color: "white", font: { size: 12 } },
        grid: { display: false },
      },
    },
  };
  return <Bar data={data} options={options} />;
};

export default function HomePage() {
  const COOKIE_NAME = "liveVoteAppCookie2025";
  const [votedFor, setVotedFor] = useState(null);
  const [isClient, setIsClient] = useState(false);

  const { data: voteData, error } = useSWR("/api/votes", fetcher, {
    refreshInterval: 2000,
  });

  useEffect(() => {
    setIsClient(true);
    const existingVote = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${COOKIE_NAME}=`))
      ?.split("=")[1];
    if (existingVote) {
      setVotedFor(existingVote);
    }
  }, []);

  const handleVote = async (voteId) => {
    if (votedFor) return;

    setVotedFor(voteId);
    document.cookie = `${COOKIE_NAME}=${voteId}; path=/; max-age=31536000; SameSite=Strict; Secure`;

    await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voteId }),
    });
  };

  const contestants = {
    dj_cheesuslive: {
      name: "dj_cheesuslive",
      imgSrc:
        "https://static-cdn.jtvnw.net/jtv_user_pictures/20f56ca7-b5d6-4b70-a3d5-1170da60308f-profile_image-300x300.png",
      twitch: "https://www.twitch.tv/dj_cheesuslive",
    },
    chillyplayzwastaken: {
      name: "chillyplayzwastaken",
      imgSrc:
        "https://static-cdn.jtvnw.net/jtv_user_pictures/170e4e46-d1ec-456e-b7d0-b1451a22e1d7-profile_image-300x300.png",
      twitch: "https://www.twitch.tv/chillyplayzwastaken",
    },
  };

  if (!isClient || !voteData) {
    return <div style={{ fontSize: "2rem" }}>Loading...</div>;
  }

  return (
    <>
      <div className="stacked-text-block">
        <div>VOTE</div>
      </div>
      <div className="container">
        {!votedFor ? (
          <div id="vote-section">
            <ContestantCard
              {...contestants.dj_cheesuslive}
              id="dj_cheesuslive"
              onVote={handleVote}
            />
            <div className="vs-text">VS</div>
            <ContestantCard
              {...contestants.chillyplayzwastaken}
              id="chillyplayzwastaken"
              onVote={handleVote}
            />
          </div>
        ) : (
          <div id="voted-section" style={{ visibility: "visible" }}>
            <ContestantCard
              {...contestants[votedFor]}
              id={votedFor}
              onVote={() => {}}
              disabled={true}
            />
            <h2 className="message-title">Thank You!</h2>
            <p className="message-subtitle">
              Your vote for {votedFor} has been counted.
            </p>
            <a
              href={contestants[votedFor].twitch}
              className="follow-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              Follow on Twitch
            </a>
            <div className="chart-container">
              <VoteChart voteData={voteData} />
            </div>
          </div>
        )}
      </div>
      <div className="stacked-text-block">
        <div>NOW</div>
      </div>
    </>
  );
}
