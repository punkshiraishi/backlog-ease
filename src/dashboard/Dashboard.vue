<template>
  <main
    w-screen bg-blueGray-100 p-10 min-h-screen
    flex flex-col items-center
  >
    <div flex flex-col items-center relative w-700px>
      <BacklogIssueListPage w="700px" />
      <BugButton self-end />
    </div>
  </main>
</template>
